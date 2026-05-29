import { useEffect, useState } from 'react';
import { generateSlowQueries, getTopSlowQueries, optimizeSlowQuery } from '../services/apiClient';
import { useAuth } from '../state/AuthContext';

export function QueriesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const data = await getTopSlowQueries(token);
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  return (
    <section>
      <h1>Slow Query Analyzer</h1>
      <div className="row-actions">
        <button type="button" onClick={async () => { await generateSlowQueries(token); await load(); }}>
          Generar muestras
        </button>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Duración</th><th>Clase</th><th>Plan</th><th>Antes/Después</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((q) => (
              <tr key={q.id}>
                <td>{q.id}</td>
                <td>{q.duration_ms} ms</td>
                <td>{q.performance_class}</td>
                <td><code>{q.execution_plan?.slice(0, 80)}</code></td>
                <td>{q.duration_ms} / {q.optimized_duration_ms || '-'} ms</td>
                <td>
                  <button type="button" onClick={async () => { await optimizeSlowQuery(token, q.id, 'idx_optimized_demo'); await load(); }}>
                    Optimizar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
