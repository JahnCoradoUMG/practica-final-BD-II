import { pool } from '../config/database.js';

export async function findAllConnections() {
  const { rows } = await pool.query(
    `SELECT id, nombre, motor, host, port, database_name, user_name, status, created_at, updated_at
     FROM connections
     ORDER BY id DESC`,
  );
  return rows;
}

export async function findConnectionById(id) {
  const { rows } = await pool.query(
    `SELECT id, nombre, motor, host, port, database_name, user_name, status, created_at, updated_at
     FROM connections
     WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

export async function insertConnection(payload) {
  const { rows } = await pool.query(
    `INSERT INTO connections (
      nombre, motor, host, port, database_name, user_name,
      password_encrypted, password_iv, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, nombre, motor, host, port, database_name, user_name, status, created_at, updated_at`,
    [
      payload.nombre,
      payload.motor,
      payload.host,
      payload.port,
      payload.databaseName,
      payload.userName,
      payload.passwordEncrypted,
      payload.passwordIv,
      payload.status,
    ],
  );
  return rows[0];
}

export async function updateConnection(id, payload) {
  const values = [
    payload.nombre,
    payload.motor,
    payload.host,
    payload.port,
    payload.databaseName,
    payload.userName,
    payload.status,
    id,
  ];

  let query = `
    UPDATE connections
    SET nombre = $1,
        motor = $2,
        host = $3,
        port = $4,
        database_name = $5,
        user_name = $6,
        status = $7`;

  if (payload.passwordEncrypted && payload.passwordIv) {
    query += `, password_encrypted = $9, password_iv = $10`;
    values.push(payload.passwordEncrypted, payload.passwordIv);
  }

  query += ' WHERE id = $8 RETURNING id, nombre, motor, host, port, database_name, user_name, status, created_at, updated_at';

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

export async function deleteConnection(id) {
  const { rowCount } = await pool.query('DELETE FROM connections WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function findConnectionsForMonitoring() {
  const { rows } = await pool.query(
    `SELECT id, nombre, motor, host, port, database_name, user_name, password_encrypted, password_iv, status
     FROM connections
     WHERE status IN ('ACTIVE', 'ERROR')
     ORDER BY id ASC`,
  );
  return rows;
}

export async function updateConnectionStatus(id, status) {
  await pool.query('UPDATE connections SET status = $1 WHERE id = $2', [status, id]);
}
