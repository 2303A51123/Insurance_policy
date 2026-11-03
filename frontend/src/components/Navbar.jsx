import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { BrandMark } from './Icon';

const roleNames = {
  admin: 'Administrator',
  agent: 'Policy Agent',
  policyholder: 'Policyholder',
  claimsOfficer: 'Claims Officer',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user?.name?.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';

  return (
    <header className="topbar">
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
        <span className="menu-lines" aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        <span>{menuOpen ? 'Close' : 'Menu'}</span>
      </button>
      <Link className="brand" to="/dashboard"><BrandMark /><span>Policy Desk<small>INSURANCE PORTAL</small></span></Link>
      <div className="account">
        <span className="account-avatar" aria-hidden="true">{initials}</span>
        <span className="account-details"><span className="account-name">{user?.name}</span><span className="role-label">{roleNames[user?.role]}</span></span>
        <button className="button secondary small" onClick={logout}>Log out</button>
      </div>
      {menuOpen && <div className="mobile-menu"><Sidebar role={user?.role} onNavigate={() => setMenuOpen(false)} /></div>}
    </header>
  );
}
