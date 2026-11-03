import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SidebarLayout from './components/SidebarLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Policies from './pages/Policies';
import Claims from './pages/Claims';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Users from './pages/Users';

function LoadingPage() {
  return <main className="loading-page">Loading Policy Desk...</main>;
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  return user ? <SidebarLayout /> : <Navigate to="/login" replace />;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/reports" element={<RoleRoute roles={['admin']}><Reports /></RoleRoute>} />
        <Route path="/users" element={<RoleRoute roles={['admin', 'agent']}><Users /></RoleRoute>} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
