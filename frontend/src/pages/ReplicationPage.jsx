import { useEffect, useState } from 'react';
import { autoCaptureReplication, getReplicationDashboard } from '../services/apiClient';
import { useAuth } from '../state/AuthContext';

export function ReplicationPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);

  async function load() {
    const data = await getReplicationDashboard(token);
    setRows(data);
  }

  useEffect(() => {
    load();
  }, [token]);

  return (
    <section>
      <h1>Replicación y CAP</h1>
      <p>Análisis CAP documentado en `docs/database/CAP_ANALYSIS.md`.</p>
      <button type="button" onClick={async () => { await autoCaptureReplication(token); await load(); }}>
        Capturar escenarios 2s/5s/20s
      </button>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Primario</th><th>Réplica</th><th>Lag(s)</th><th>Escenario</th><th>Estado</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.primary_name}</td>
                <td>{r.replica_name}</td>
                <td>{r.lag_seconds}</td>
                <td>{r.load_scenario}</td>
                <td><span className={`status-pill status-${r.status.toLowerCase()}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
