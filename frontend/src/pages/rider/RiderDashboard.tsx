import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, LogOut, MapPin, Package, Navigation, CheckCircle2 } from 'lucide-react';
import { deliveryService } from '../../services/api';
import { connectSocket, disconnectSocket } from '../../services/socket';
import type { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';

const nextStatus: Record<string, string> = {
  ready: 'picked_up',
  picked_up: 'on_the_way',
  on_the_way: 'delivered',
};

const nextLabel: Record<string, { label: string; icon: React.ReactNode }> = {
  ready:      { label: 'Recoger pedido',   icon: <Package size={15} /> },
  picked_up:  { label: 'Salir a entregar', icon: <Navigation size={15} /> },
  on_the_way: { label: 'Marcar entregado', icon: <CheckCircle2 size={15} /> },
};

export default function RiderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    deliveryService.getAssignedOrders()
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(() => setLoading(false));

    const socket = connectSocket('rider');
    socket.on('order_status_updated', (o: Order) =>
      setOrders(prev => prev.map(x => x.id === o.id ? o : x))
    );
    return () => disconnectSocket();
  }, []);

  const handleUpdate = async (orderId: number, status: string) => {
    await deliveryService.updateStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bike size={20} color="var(--accent-cyan)" />
          <span className="navbar-brand">App Repartidor</span>
        </div>
        <button className="btn btn-danger" style={{ padding: '0.65rem' }} onClick={logout}>
          <LogOut size={16} />
        </button>
      </nav>

      <div className="page" style={{ maxWidth: '700px' }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Syne, sans-serif' }}>Mis entregas</h2>

        {loading ? (
          <div className="loader">Cargando entregas...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <Bike size={52} />
            <h3>Sin entregas asignadas</h3>
            <p>Espera a que el negocio te asigne un pedido</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '0.3rem' }}>Pedido #{order.id}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} /> {order.delivery_address}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                    <p style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: '0.4rem', fontFamily: 'Syne, sans-serif' }}>
                      ${order.total}
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                  {order.items?.map((item, i) => (
                    <p key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                      {item.quantity}x {item.name}
                    </p>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {nextStatus[order.status] && (
                    <button className="btn btn-primary"
                      onClick={() => handleUpdate(order.id, nextStatus[order.status])}>
                      {nextLabel[order.status]?.icon} {nextLabel[order.status]?.label}
                    </button>
                  )}
                  <button className="btn btn-secondary"
                    onClick={() => navigate(`/rider/delivery/${order.id}`)}>
                    <MapPin size={15} /> Ver mapa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

