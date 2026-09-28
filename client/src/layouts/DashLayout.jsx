import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const customerLinks = [
  ['/app', 'Dashboard'],
  ['/app/bookings', 'Bookings'],
  ['/app/favorites', 'Favorites'],
  ['/app/messages', 'Messages'],
  ['/app/notifications', 'Notifications'],
  ['/app/profile', 'Profile'],
];

const providerLinks = [
  ['/provider', 'Dashboard'],
  ['/provider/requests', 'Requests'],
  ['/provider/services', 'Services'],
  ['/provider/portfolio', 'Portfolio'],
  ['/provider/messages', 'Messages'],
  ['/provider/notifications', 'Notifications'],
  ['/provider/profile', 'Profile'],
];

const adminLinks = [
  ['/admin', 'Dashboard'],
  ['/admin/users', 'Users'],
  ['/admin/providers', 'Providers'],
  ['/admin/verifications', 'Verifications'],
  ['/admin/categories', 'Categories'],
  ['/admin/services', 'Services'],
  ['/admin/bookings', 'Bookings'],
  ['/admin/reviews', 'Reviews'],
  ['/admin/reports', 'Reports'],
  ['/admin/analytics', 'Analytics'],
  ['/admin/audit', 'Audit logs'],
  ['/admin/settings', 'Settings'],
];

export default function DashLayout({ role }) {
  const { user } = useAuth();
  const links = role === 'admin' ? adminLinks : role === 'provider' ? providerLinks : customerLinks;
  return (
    <div className="app-shell">
      <Navbar />
      <div className="dash">
        <aside className="side" aria-label="Dashboard">
          <p style={{ padding: '0 12px' }}>
            {user?.name}
            <br />
            <small>{user?.role}</small>
          </p>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to.split('/').length <= 2}>
              {label}
            </NavLink>
          ))}
        </aside>
        <main className="dash-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
