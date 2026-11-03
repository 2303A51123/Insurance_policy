import { NavLink } from 'react-router-dom';

const navigation = {
  admin: [
    ['Dashboard', '/dashboard'],
    ['Insurance products', '/products'],
    ['Policies', '/policies'],
    ['Claims', '/claims'],
    ['Premium payments', '/payments'],
    ['Reports', '/reports'],
    ['Users', '/users'],
  ],
  agent: [
    ['Dashboard', '/dashboard'],
    ['Insurance products', '/products'],
    ['Policies', '/policies'],
    ['Premium payments', '/payments'],
    ['Policyholders', '/users'],
  ],
  policyholder: [
    ['My dashboard', '/dashboard'],
    ['Insurance products', '/products'],
    ['My policies', '/policies'],
    ['Submit a claim', '/claims'],
    ['My payments', '/payments'],
  ],
  claimsOfficer: [
    ['Dashboard', '/dashboard'],
    ['Assigned claims', '/claims'],
  ],
};

export default function Sidebar({ role, onNavigate }) {
  return (
    <nav className="sidebar-nav" aria-label="Main navigation">
      {(navigation[role] || []).map(([label, path]) => (
        <NavLink key={path} to={path} onClick={onNavigate} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
