import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/connections', label: 'Motores BD' },
  { to: '/health', label: 'Health Check' },
  { to: '/queries', label: 'Slow Queries' },
  { to: '/tx', label: 'Concurrencia' },
  { to: '/backups', label: 'Backups' },
  { to: '/replication', label: 'Replicación' },
  { to: '/cache', label: 'Cache Redis' },
  { to: '/alerts', label: 'Alertas' },
  { to: '/bi', label: 'Power BI' },
  { to: '/system', label: 'Sistema' },
];

export function AppLayout({ children }) {
  const { logout, user } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/dashboard">
          DataOps Control Center
        </Link>
        <div className="topbar-actions">
          <span className="user-pill">{user?.username || 'admin'}</span>
          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="content-shell">
        <aside className="sidebar">
          <nav>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
