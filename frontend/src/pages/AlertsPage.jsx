import { useEffect, useState } from 'react';
import { ackAlert, evaluateAlerts, getAlertsDashboard, resolveAlert, updateAlertRule } from '../services/apiClient';
import { useAuth } from '../state/AuthContext';

export function AlertsPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState({ rules: [], logs: [] });

  async function load() {
    const data = await getAlertsDashboard(token);
    setDashboard(data);
  }

  useEffect(() => {
    load();
  }, [token]);

  return (
    <section>
      <h1>Motor de Alertas</h1>
      <div className="row-actions">
        <button type="button" onClick={async () => { await evaluateAlerts(token); await load(); }}>
          Evaluar reglas
        </button>
      </div>
      <h2>Reglas</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Código</th><th>Métrica</th><th>Umbral</th><th>Severidad</th><th>Acción</th></tr></thead>
          <tbody>
            {(dashboard.rules || []).map((r) => (
              <tr key={r.id}>
                <td>{r.rule_code}</td>
                <td>{r.metric_name}</td>
                <td>{r.operator} {r.threshold_value}</td>
                <td>{r.severity}</td>
                <td>
                  <button type="button" onClick={async () => { await updateAlertRule(token, r.id, { thresholdValue: Number(r.threshold_value) + 1 }); await load(); }}>
                    +1 umbral
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Historial</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Condición</th><th>Severidad</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {(dashboard.logs || []).map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.condition_text}</td>
                <td>{log.severity}</td>
                <td>{log.resolution_status}</td>
                <td className="row-actions">
                  <button type="button" onClick={async () => { await ackAlert(token, log.id, 'ack desde UI'); await load(); }}>Ack</button>
                  <button type="button" onClick={async () => { await resolveAlert(token, log.id, 'resuelto desde UI'); await load(); }}>Resolver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
