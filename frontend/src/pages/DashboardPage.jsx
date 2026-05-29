import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getConnections } from '../services/apiClient';
import { useAuth } from '../state/AuthContext';

export function DashboardPage() {
  const { token } = useAuth();
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getConnections(token);
        setConnections(data.slice(0, 5));
      } catch {
        setConnections([]);
      }
    }
    load();
  }, [token]);

  return (
    <section>
      <h1>Dashboard</h1>
      <p>Shell de operación listo para integrar los módulos funcionales SCRUM-11 a SCRUM-20.</p>

      <div className="grid-cards">
        <article className="card">
          <h2>Registro de motores</h2>
          <p>Administración de conexiones y credenciales cifradas.</p>
          <span className="badge">SCRUM-11</span>
          <div>
            <Link to="/connections">Gestionar conexiones</Link>
          </div>
        </article>
        <article className="card">
          <h2>Health Check</h2>
          <p>Visualización de métricas de salud por motor.</p>
          <Link to="/health">Ver métricas</Link>
        </article>
        <article className="card">
          <h2>Información del sistema</h2>
          <p>Estado de API, base de metadatos y conectores.</p>
          <Link to="/system">Ver detalles</Link>
        </article>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Conexión</th>
              <th>Motor</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((item) => (
              <tr key={item.id}>
                <td>{item.nombre}</td>
                <td>{item.motor}</td>
                <td>
                  <span className={`status-pill status-${item.status.toLowerCase()}`}>{item.status}</span>
                </td>
              </tr>
            ))}
            {connections.length === 0 ? (
              <tr>
                <td colSpan="3">Sin conexiones registradas</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
