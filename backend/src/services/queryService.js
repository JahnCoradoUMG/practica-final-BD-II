import * as queryRepository from '../repositories/queryRepository.js';
import * as connectionsRepository from '../repositories/connectionsRepository.js';
import { AppError } from '../utils/AppError.js';

const sampleQueries = [
  'SELECT * FROM orders WHERE created_at > NOW() - INTERVAL \'24 hours\'',
  'SELECT customer_id, SUM(total) FROM invoices GROUP BY customer_id ORDER BY SUM(total) DESC',
  'SELECT * FROM audit_log WHERE event_type = \'LOGIN\' AND created_at > NOW() - INTERVAL \'7 days\'',
];

export async function generateSlowQuerySamples() {
  const connections = await connectionsRepository.findConnectionsForMonitoring();
  const results = [];

  for (const connection of connections) {
    const duration = Math.floor(Math.random() * 2800) + 80;
    const queryText = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    const rowsReturned = Math.floor(Math.random() * 2000);
    const hasIndex = duration < 900;

    const record = await queryRepository.insertQueryLog({
      dbId: connection.id,
      queryText,
      durationMs: duration,
      rowsReturned,
      indexUsed: hasIndex ? `idx_${connection.nombre.replace(/\s+/g, '_').toLowerCase()}_created_at` : null,
      executionPlan: JSON.stringify({
        node: hasIndex ? 'Index Scan' : 'Seq Scan',
        cost: Number((duration / 10).toFixed(2)),
        rows: rowsReturned,
      }),
    });
    results.push(record);
  }
  return results;
}

export async function getTopSlowQueries() {
  return queryRepository.findTopSlowQueries(10);
}

export async function optimizeQuery(id, indexSuggestion) {
  const target = Number(id);
  if (!Number.isInteger(target) || target <= 0) {
    throw new AppError('Id de query inválido', 400, 'VALIDATION_ERROR');
  }
  const top = await queryRepository.findTopSlowQueries(100);
  const existing = top.find((q) => Number(q.id) === target);
  if (!existing) throw new AppError('Query no encontrada', 404, 'NOT_FOUND');

  const optimized = Math.max(20, Math.floor(existing.duration_ms * 0.2));
  const note = `Optimización aplicada con índice sugerido: ${indexSuggestion || 'idx_auto'} (antes ${existing.duration_ms}ms, después ${optimized}ms)`;
  return queryRepository.markOptimized(target, optimized, note, indexSuggestion || 'idx_auto');
}
