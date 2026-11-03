import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function SidebarLayout() {
  const { user } = useAuth();
  return (
    <div className="app-shell">
      <Navbar />
      <div className="layout-body">
        <aside className="desktop-sidebar">
          <Sidebar role={user?.role} />
          <div className="sidebar-note">
            <span className="sidebar-note-mark">✓</span>
            <div><strong>Private workspace</strong><span>Your information stays secure</span></div>
          </div>
        </aside>
        <main className="main-content"><Outlet /></main>
      </div>
    </div>
  );
}
