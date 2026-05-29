import crypto from 'crypto';
import env from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKeyMaterial() {
  return crypto.createHash('sha256').update(env.credentialsEncryptionKey, 'utf8').digest();
}

export function encryptSecret(plainText) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKeyMaterial(), iv);

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encrypted: Buffer.concat([encrypted, authTag]),
    iv,
  };
}

export function decryptSecret(encryptedPayload, iv) {
  const payloadBuffer = Buffer.isBuffer(encryptedPayload)
    ? encryptedPayload
    : Buffer.from(encryptedPayload);
  const ivBuffer = Buffer.isBuffer(iv) ? iv : Buffer.from(iv);

  const authTag = payloadBuffer.subarray(payloadBuffer.length - 16);
  const ciphertext = payloadBuffer.subarray(0, payloadBuffer.length - 16);
  const decipher = crypto.createDecipheriv(ALGORITHM, getKeyMaterial(), ivBuffer);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}
