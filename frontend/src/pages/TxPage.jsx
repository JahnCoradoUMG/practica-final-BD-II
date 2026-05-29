import { useEffect, useState } from 'react';
import { getTxDashboard, simulateConcurrency } from '../services/apiClient';
import { useAuth } from '../state/AuthContext';

export function TxPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState({ stats: {}, items: [] });

  async function load() {
    const data = await getTxDashboard(token);
    setDashboard(data);
  }

  useEffect(() => {
    load();
  }, [token]);

  return (
    <section>
      <h1>Concurrencia y Deadlocks</h1>
      <div className="row-actions">
        <button type="button" onClick={async () => { await simulateConcurrency(token, 100); await load(); }}>
          Simular 100 usuarios
        </button>
      </div>
      <p>
        Total: {dashboard.stats.total || 0} | Deadlocks: {dashboard.stats.deadlocks || 0} | Wait avg: {dashboard.stats.avg_wait_time || 0} ms
      </p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sesión</th><th>Operación</th><th>Wait</th><th>Lock</th><th>Resuelto</th></tr></thead>
          <tbody>
            {(dashboard.items || []).map((item) => (
              <tr key={item.id}>
                <td>{item.session_id}</td>
                <td>{item.operacion}</td>
                <td>{item.wait_time}</td>
                <td>{item.lock_type}</td>
                <td>{item.resolved ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
