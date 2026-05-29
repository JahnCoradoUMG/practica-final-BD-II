import { useEffect, useState } from 'react';
import { getBackupDashboard, getConnections, runBackup, simulateRestore } from '../services/apiClient';
import { useAuth } from '../state/AuthContext';

export function BackupPage() {
  const { token } = useAuth();
  const [connections, setConnections] = useState([]);
  const [history, setHistory] = useState([]);
  const [dbId, setDbId] = useState('');

  async function load() {
    const [connectionsData, dashboard] = await Promise.all([
      getConnections(token),
      getBackupDashboard(token),
    ]);
    setConnections(connectionsData);
    setHistory(dashboard.history || []);
    if (!dbId && connectionsData.length) setDbId(String(connectionsData[0].id));
  }

  useEffect(() => {
    load();
  }, [token]);

  return (
    <section>
      <h1>Backups FULL/DIFF/INC</h1>
      <div className="row-actions">
        <select value={dbId} onChange={(e) => setDbId(e.target.value)}>
          {connections.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <button type="button" onClick={async () => { await runBackup(token, { dbId: Number(dbId), backupType: 'FULL' }); await load(); }}>FULL</button>
        <button type="button" onClick={async () => { await runBackup(token, { dbId: Number(dbId), backupType: 'DIFF' }); await load(); }}>DIFF</button>
        <button type="button" onClick={async () => { await runBackup(token, { dbId: Number(dbId), backupType: 'INC' }); await load(); }}>INC</button>
        <button type="button" onClick={async () => { await runBackup(token, { dbId: Number(dbId), backupType: 'FULL', snapshotName: 'PRE_DEPLOY' }); await load(); }}>Snapshot PRE_DEPLOY</button>
        <button type="button" onClick={async () => { await simulateRestore(token, Number(dbId)); }}>Simular restore</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Tipo</th><th>Estado</th><th>Tamaño MB</th><th>RPO</th><th>RTO</th><th>SLA</th><th>URL remoto</th></tr></thead>
          <tbody>
            {history.map((b) => (
              <tr key={b.id}>
                <td>{b.backup_type}</td>
                <td>{b.status}</td>
                <td>{b.size_mb}</td>
                <td>{b.rpo_minutes}</td>
                <td>{b.rto_minutes}</td>
                <td>{b.sla_compliant ? 'Sí' : 'No'}</td>
                <td>{b.remote_url ? <a href={b.remote_url} target="_blank" rel="noreferrer">Blob</a> : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
