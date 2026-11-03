import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const navigation = {
  admin: [
    ['Dashboard', '/dashboard', 'grid'],
    ['Insurance products', '/products', 'package'],
    ['Policies', '/policies', 'file'],
    ['Claims', '/claims', 'shield'],
    ['Premium payments', '/payments', 'credit'],
    ['Reports', '/reports', 'chart'],
    ['Users', '/users', 'users'],
  ],
  agent: [
    ['Dashboard', '/dashboard', 'grid'],
    ['Insurance products', '/products', 'package'],
    ['Policies', '/policies', 'file'],
    ['Premium payments', '/payments', 'credit'],
    ['Policyholders', '/users', 'users'],
  ],
  policyholder: [
    ['My dashboard', '/dashboard', 'grid'],
    ['Insurance products', '/products', 'package'],
    ['My policies', '/policies', 'file'],
    ['Submit a claim', '/claims', 'upload'],
    ['My payments', '/payments', 'credit'],
  ],
  claimsOfficer: [
    ['Dashboard', '/dashboard', 'grid'],
    ['Assigned claims', '/claims', 'shield'],
  ],
};

export default function Sidebar({ role, onNavigate }) {
  return (
    <>
      <p className="sidebar-label">WORKSPACE</p>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {(navigation[role] || []).map(([label, path, icon]) => (
          <NavLink key={path} to={path} onClick={onNavigate} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon"><Icon name={icon} /></span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
