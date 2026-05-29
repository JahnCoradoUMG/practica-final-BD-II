import { useEffect, useState } from 'react';
import { getSystemInfo } from '../services/apiClient';
import { useAuth } from '../state/AuthContext';

export function SystemPage() {
  const { token } = useAuth();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInfo() {
      try {
        const data = await getSystemInfo(token);
        setInfo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadInfo();
  }, [token]);

  if (loading) return <p>Cargando información...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <section>
      <h1>Sistema</h1>
      <p>Datos del endpoint protegido `/api/system/info`.</p>

      <div className="grid-cards">
        <article className="card">
          <h2>API</h2>
          <p>{info?.api?.status || 'Sin datos'}</p>
        </article>
        <article className="card">
          <h2>Base de metadatos</h2>
          <p>{info?.database?.status || 'Sin datos'}</p>
        </article>
        <article className="card">
          <h2>Conectores</h2>
          <p>{Array.isArray(info?.connectors) ? info.connectors.length : 0} registrados</p>
        </article>
      </div>
    </section>
  );
}
