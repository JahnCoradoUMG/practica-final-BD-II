import { useEffect, useState } from 'react';
import {
  createConnection,
  deleteConnection,
  getConnections,
  testConnection,
  updateConnection,
} from '../services/apiClient';
import { useAuth } from '../state/AuthContext';

const initialForm = {
  nombre: '',
  motor: 'POSTGRESQL',
  host: 'localhost',
  port: 5432,
  database: '',
  usuario: '',
  password: '',
};

export function ConnectionsPage() {
  const { token } = useAuth();
  const [connections, setConnections] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState(null);

  async function loadConnections() {
    setLoading(true);
    setError('');
    try {
      const data = await getConnections(token);
      setConnections(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConnections();
  }, [token]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'port' ? Number(value) : value,
    }));
  }

  async function handleTestConnection() {
    setError('');
    setTestResult(null);
    try {
      const data = await testConnection(token, form);
      setTestResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateConnection(token, editingId, form);
      } else {
        await createConnection(token, form);
      }
      setForm(initialForm);
      setEditingId(null);
      setTestResult(null);
      await loadConnections();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('¿Eliminar esta conexión?');
    if (!confirmed) return;

    try {
      await deleteConnection(token, id);
      await loadConnections();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      nombre: item.nombre,
      motor: item.motor,
      host: item.host,
      port: item.port,
      database: item.database,
      usuario: item.usuario,
      password: '',
    });
    setTestResult(null);
  }

  return (
    <section>
      <h1>Registro de motores</h1>
      <p>Alta, edición, baja y prueba de conectividad para Oracle, SQL Server y PostgreSQL.</p>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <select name="motor" value={form.motor} onChange={handleChange}>
          <option value="POSTGRESQL">POSTGRESQL</option>
          <option value="SQL_SERVER">SQL_SERVER</option>
          <option value="ORACLE">ORACLE</option>
        </select>
        <input name="host" placeholder="Host" value={form.host} onChange={handleChange} required />
        <input
          name="port"
          type="number"
          min="1"
          max="65535"
          placeholder="Puerto"
          value={form.port}
          onChange={handleChange}
          required
        />
        <input
          name="database"
          placeholder="Database / SID"
          value={form.database}
          onChange={handleChange}
          required
        />
        <input name="usuario" placeholder="Usuario" value={form.usuario} onChange={handleChange} required />
        <input
          name="password"
          type="password"
          placeholder={editingId ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          value={form.password}
          onChange={handleChange}
          required={!editingId}
        />

        <div className="row-actions">
          <button type="button" onClick={handleTestConnection}>
            Test conexión
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Registrar'}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
                setTestResult(null);
              }}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      {testResult ? (
        <p className={testResult.ok ? 'success-text' : 'error-text'}>
          {testResult.ok ? 'OK:' : 'ERROR:'} {testResult.message}
        </p>
      ) : null}
      {error ? <p className="error-text">{error}</p> : null}

      {loading ? (
        <p>Cargando conexiones...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Motor</th>
                <th>Host</th>
                <th>DB</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>{item.motor}</td>
                  <td>
                    {item.host}:{item.port}
                  </td>
                  <td>{item.database}</td>
                  <td>{item.usuario}</td>
                  <td>
                    <span className={`status-pill status-${item.status.toLowerCase()}`}>{item.status}</span>
                  </td>
                  <td className="row-actions">
                    <button type="button" onClick={() => startEdit(item)}>
                      Editar
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
