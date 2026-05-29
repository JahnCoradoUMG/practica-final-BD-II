import * as txRepository from '../repositories/txRepository.js';
import * as connectionsRepository from '../repositories/connectionsRepository.js';

const operations = ['INSERT', 'UPDATE', 'DELETE', 'SELECT'];

export async function simulateConcurrency(userCount = 100) {
  const connections = await connectionsRepository.findConnectionsForMonitoring();
  if (connections.length === 0) return { generated: 0 };

  const baseConnection = connections[0];
  const tasks = Array.from({ length: userCount }).map(async (_, index) => {
    const now = new Date();
    const waitTime = Math.floor(Math.random() * 1200);
    const isDeadlock = Math.random() < 0.08;
    const lockType = isDeadlock ? 'DEADLOCK' : Math.random() < 0.2 ? 'EXCLUSIVE' : 'SHARED';
    const fin = new Date(now.getTime() + waitTime + 20);

    return txRepository.insertTxLog({
      dbId: baseConnection.id,
      sessionId: `sess-${Date.now()}-${index + 1}`,
      operacion: operations[Math.floor(Math.random() * operations.length)],
      inicio: now,
      fin,
      waitTime,
      lockType,
      resolved: isDeadlock,
    });
  });

  await Promise.all(tasks);
  return { generated: userCount };
}

export async function getTxDashboard() {
  const [stats, items] = await Promise.all([txRepository.findTxStats(), txRepository.findTxOverview(100)]);
  return { stats, items };
}
