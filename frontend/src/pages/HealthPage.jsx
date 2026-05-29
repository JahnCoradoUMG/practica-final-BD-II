import { useEffect, useState } from 'react';
import { getHealthMetricsHistory, getLatestHealthMetrics } from '../services/apiClient';
import { useAuth } from '../state/AuthContext';

export function HealthPage() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [latestData, historyData] = await Promise.all([
          getLatestHealthMetrics(token),
          getHealthMetricsHistory(token, 30),
        ]);
        setMetrics(latestData);
        setHistory(historyData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [token]);

  if (loading) return <p>Cargando métricas...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <section>
      <h1>Health Check</h1>
      <p>Métricas actuales del endpoint protegido `/api/health/metrics/latest`.</p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Conexión</th>
              <th>Motor</th>
              <th>CPU</th>
              <th>Memoria</th>
              <th>Conexiones</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((item) => (
              <tr key={`${item.connection_name}-${item.capture_time}`}>
                <td>{item.connection_name}</td>
                <td>{item.motor}</td>
                <td>{item.cpu}</td>
                <td>{item.memory}</td>
                <td>{item.connections}</td>
                <td>
                  <span className={`status-pill status-${String(item.health_status || 'inactive').toLowerCase()}`}>
                    {item.health_status || 'INACTIVE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Historial reciente</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Conexión</th>
              <th>CPU</th>
              <th>Memoria</th>
              <th>Conexiones</th>
              <th>Locks</th>
              <th>Deadlocks</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.capture_time).toLocaleString()}</td>
                <td>{item.connection_name}</td>
                <td>{item.cpu}</td>
                <td>{item.memory}</td>
                <td>{item.connections}</td>
                <td>{item.locks}</td>
                <td>{item.deadlocks}</td>
                <td>
                  <span
                    className={`status-pill status-${String(item.health_status || 'inactive').toLowerCase()}`}
                  >
                    {item.health_status || 'INACTIVE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
