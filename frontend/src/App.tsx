import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/client/Home';
import Menu from './pages/client/Menu';
import Cart from './pages/client/Cart';
import OrderTracking from './pages/client/OrderTracking';
import OrderHistory from './pages/client/OrderHistory';
import Dashboard from './pages/business/Dashboard';
import Orders from './pages/business/Orders';
import MenuManager from './pages/business/MenuManager';
import RiderDashboard from './pages/rider/RiderDashboard';
import DeliveryMap from './pages/rider/DeliveryMap';

const ProtectedRoute = ({ children, roles }: { children: any; roles?: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        user?.role === 'business' ? <Navigate to="/business" /> :
        user?.role === 'rider' ? <Navigate to="/rider" /> :
        <Navigate to="/home" />
      } />
      <Route path="/home" element={<ProtectedRoute roles={['client']}><Home /></ProtectedRoute>} />
      <Route path="/menu" element={<ProtectedRoute roles={['client']}><Menu /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute roles={['client']}><Cart /></ProtectedRoute>} />
      <Route path="/tracking/:orderId" element={<ProtectedRoute roles={['client']}><OrderTracking /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute roles={['client']}><OrderHistory /></ProtectedRoute>} />
      <Route path="/business" element={<ProtectedRoute roles={['business']}><Dashboard /></ProtectedRoute>} />
      <Route path="/business/orders" element={<ProtectedRoute roles={['business']}><Orders /></ProtectedRoute>} />
      <Route path="/business/menu" element={<ProtectedRoute roles={['business']}><MenuManager /></ProtectedRoute>} />
      <Route path="/rider" element={<ProtectedRoute roles={['rider']}><RiderDashboard /></ProtectedRoute>} />
      <Route path="/rider/delivery/:orderId" element={<ProtectedRoute roles={['rider']}><DeliveryMap /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
