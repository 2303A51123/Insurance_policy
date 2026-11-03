import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const roleNames = {
  admin: 'Administrator',
  agent: 'Policy Agent',
  policyholder: 'Policyholder',
  claimsOfficer: 'Claims Officer',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
        {menuOpen ? 'Close' : 'Menu'}
      </button>
      <a className="brand" href="/dashboard"><span className="brand-mark">P</span> Policy Desk</a>
      <div className="account">
        <span className="account-name">{user?.name}</span>
        <span className="role-label">{roleNames[user?.role]}</span>
        <button className="button secondary small" onClick={logout}>Log out</button>
      </div>
      {menuOpen && <div className="mobile-menu"><Sidebar role={user?.role} onNavigate={() => setMenuOpen(false)} /></div>}
    </header>
  );
}
