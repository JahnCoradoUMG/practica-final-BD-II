import { pool } from '../config/database.js';

export async function createBackupRecord(payload) {
  const { rows } = await pool.query(
    `INSERT INTO backup_history
      (db_id, backup_type, status, file_path, size_mb, duration_seconds, restore_point, parent_full_id,
       snapshot_name, integrity_hash, hash_algorithm, remote_url, sla_compliant, rpo_minutes, rto_minutes,
       started_at, completed_at, error_message)
     VALUES
      ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15, $16)
     RETURNING *`,
    [
      payload.dbId,
      payload.backupType,
      payload.status,
      payload.filePath,
      payload.sizeMb,
      payload.durationSeconds,
      payload.parentFullId ?? null,
      payload.snapshotName ?? null,
      payload.integrityHash ?? null,
      payload.hashAlgorithm ?? 'SHA256',
      payload.remoteUrl ?? null,
      payload.slaCompliant ?? null,
      payload.rpoMinutes ?? null,
      payload.rtoMinutes ?? null,
      payload.completedAt ?? null,
      payload.errorMessage ?? null,
    ],
  );
  return rows[0];
}

export async function findLatestFullBackup(dbId) {
  const { rows } = await pool.query(
    `SELECT * FROM backup_history
     WHERE db_id = $1 AND backup_type = 'FULL'
     ORDER BY started_at DESC
     LIMIT 1`,
    [dbId],
  );
  return rows[0] || null;
}

export async function findLatestBackup(dbId) {
  const { rows } = await pool.query(
    `SELECT * FROM backup_history
     WHERE db_id = $1
     ORDER BY started_at DESC
     LIMIT 1`,
    [dbId],
  );
  return rows[0] || null;
}

export async function listBackupHistory(limit = 100) {
  const { rows } = await pool.query(
    `SELECT b.*, c.nombre AS connection_name, c.motor
     FROM backup_history b
     JOIN connections c ON c.id = b.db_id
     ORDER BY b.started_at DESC
     LIMIT $1`,
    [limit],
  );
  return rows;
}
