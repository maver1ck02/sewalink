import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <b>SewaLink</b>
            <p className="muted">Find trusted people for every job.</p>
          </div>
          <div>
            <div>Kathmandu, Nepal</div>
            <div>support@sewalink.local</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
