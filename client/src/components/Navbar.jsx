import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { initials, userId } from '../utils/user';

function dashPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'provider') return '/provider';
  return '/app';
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function onLogout() {
    await logout();
    setMenu(false);
    navigate('/');
  }

  const dashboard = user ? dashPath(user.role) : '/login';

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span> SewaLink
        </Link>
        <button type="button" className="nav-toggle" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          {open ? <FiX /> : <FiMenu />}
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/search" onClick={() => setOpen(false)}>Find services</NavLink>
          {!user || user.role === 'customer' ? (
            <NavLink to="/become-provider" onClick={() => setOpen(false)}>Become a provider</NavLink>
          ) : null}
          {user ? (
            <>
              <NavLink to={dashboard} onClick={() => setOpen(false)}>Dashboard</NavLink>
              <div className="user-menu" ref={menuRef}>
                <button type="button" className="user-chip" onClick={() => setMenu((v) => !v)} aria-expanded={menu}>
                  <span className="user-avatar">{initials(user.name) || 'U'}</span>
                  {user.name}
                </button>
                {menu && (
                  <div className="user-dropdown">
                    <Link to={dashboard} onClick={() => setMenu(false)}>Dashboard</Link>
                    <Link
                      to={user.role === 'provider' ? '/provider/profile' : user.role === 'admin' ? '/admin/settings' : '/app/profile'}
                      onClick={() => setMenu(false)}
                    >
                      Profile
                    </Link>
                    {user.role !== 'admin' && (
                      <Link
                        to={user.role === 'provider' ? '/provider/messages' : '/app/messages'}
                        onClick={() => setMenu(false)}
                      >
                        Messages
                      </Link>
                    )}
                    <button type="button" className="danger" onClick={onLogout}>Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Log in</NavLink>
              <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>Get started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export { dashPath, userId };
