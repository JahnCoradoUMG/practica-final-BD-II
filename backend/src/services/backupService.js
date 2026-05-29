import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { BlobServiceClient } from '@azure/storage-blob';
import env from '../config/env.js';
import * as backupRepository from '../repositories/backupRepository.js';
import * as connectionsRepository from '../repositories/connectionsRepository.js';
import { AppError } from '../utils/AppError.js';

const BACKUP_DIR = path.resolve(process.cwd(), '..', 'backups');

async function ensureBackupDir() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

function getSlaStatus(rpoMinutes, rtoMinutes) {
  return rpoMinutes <= 15 && rtoMinutes <= 45;
}

async function uploadToAzureIfConfigured(filePath, fileName) {
  if (!env.azure.connectionString) {
    return { remoteUrl: null };
  }
  const blobServiceClient = BlobServiceClient.fromConnectionString(env.azure.connectionString);
  const containerClient = blobServiceClient.getContainerClient(env.azure.container);
  await containerClient.createIfNotExists();
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  const data = await fs.readFile(filePath);
  await blockBlobClient.uploadData(data);
  return { remoteUrl: blockBlobClient.url };
}

export async function runBackup(dbId, backupType, snapshotName = null) {
  const connection = await connectionsRepository.findConnectionById(dbId);
  if (!connection) throw new AppError('Conexión no encontrada', 404, 'NOT_FOUND');

  await ensureBackupDir();
  const startedAt = Date.now();

  let parentFullId = null;
  if (backupType === 'DIFF') {
    const latestFull = await backupRepository.findLatestFullBackup(dbId);
    parentFullId = latestFull?.id ?? null;
  } else if (backupType === 'INC') {
    const latestAny = await backupRepository.findLatestBackup(dbId);
    parentFullId = latestAny?.parent_full_id ?? latestAny?.id ?? null;
  }

  const fileName = `${connection.nombre.replace(/\s+/g, '_')}-${backupType}-${Date.now()}.json`;
  const filePath = path.join(BACKUP_DIR, fileName);
  const payload = {
    connection,
    backupType,
    snapshotName,
    generatedAt: new Date().toISOString(),
    seedData: crypto.randomBytes(1024).toString('hex'),
  };
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');

  const fileBuffer = await fs.readFile(filePath);
  const sizeMb = Number((fileBuffer.byteLength / 1024 / 1024).toFixed(2));
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const { remoteUrl } = await uploadToAzureIfConfigured(filePath, fileName);

  const durationSeconds = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
  const rpoMinutes = Number((Math.random() * 20).toFixed(2));
  const rtoMinutes = Number((Math.random() * 50).toFixed(2));
  const slaCompliant = getSlaStatus(rpoMinutes, rtoMinutes);

  return backupRepository.createBackupRecord({
    dbId,
    backupType,
    status: 'SUCCESS',
    filePath,
    sizeMb,
    durationSeconds,
    parentFullId,
    snapshotName,
    integrityHash: hash,
    hashAlgorithm: 'SHA256',
    remoteUrl,
    slaCompliant,
    rpoMinutes,
    rtoMinutes,
    completedAt: new Date(),
  });
}

export async function getBackupDashboard() {
  const history = await backupRepository.listBackupHistory(100);
  return { history };
}

export async function recordFailedBackup(dbId) {
  const connection = await connectionsRepository.findConnectionById(dbId);
  if (!connection) throw new AppError('Conexión no encontrada', 404, 'NOT_FOUND');

  return backupRepository.createBackupRecord({
    dbId,
    backupType: 'FULL',
    status: 'FAILED',
    filePath: null,
    sizeMb: 0,
    durationSeconds: 0,
    errorMessage: 'Backup simulado fallido (E2E / demo)',
    completedAt: new Date(),
  });
}

export async function simulateRestore(dbId) {
  const latest = await backupRepository.findLatestBackup(dbId);
  if (!latest) throw new AppError('No hay backups para restaurar', 400, 'NO_BACKUPS');
  const restoreSeconds = Math.floor(Math.random() * 1800) + 120;
  return {
    dbId,
    backupId: latest.id,
    restorePoint: latest.restore_point,
    restoreSeconds,
    rtoMinutes: Number((restoreSeconds / 60).toFixed(2)),
  };
}
