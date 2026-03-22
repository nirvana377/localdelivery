import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ClipboardList, UtensilsCrossed, LogOut, TrendingUp, DollarSign, Zap, ChevronRight } from 'lucide-react';
import { orderService } from '../../services/api';
import { connectSocket, disconnectSocket } from '../../services/socket';
import type { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    orderService.getAll().then(res => { setOrders(res.data); setLoading(false); });
    const socket = connectSocket('business');
    socket.on('order_received', (o: Order) => setOrders(prev => [o, ...prev]));
    socket.on('order_status_updated', (o: Order) => setOrders(prev => prev.map(x => x.id === o.id ? o : x)));
    return () => disconnectSocket();
  }, []);

  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());
  const todaySales = todayOrders.reduce((s, o) => s + Number(o.total), 0);
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

  const stats = [
    { icon: <TrendingUp size={20} />, value: todayOrders.length, label: 'Pedidos hoy', color: 'var(--accent-cyan)' },
    { icon: <DollarSign size={20} />, value: `$${todaySales.toFixed(0)}`, label: 'Ventas hoy', color: 'var(--accent-green)' },
    { icon: <Zap size={20} />, value: activeOrders.length, label: 'Activos', color: '#a78bfa' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <span className="navbar-brand">Panel del Negocio</span>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/business/orders')}>
            <ClipboardList size={16} /> Pedidos
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/business/menu')}>
            <UtensilsCrossed size={16} /> Menú
          </button>
          <button className="btn btn-danger" style={{ padding: '0.65rem' }} onClick={logout}>
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <Store size={22} color="var(--text-secondary)" />
          <h2 style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</h2>
        </div>

        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.75rem' }}>
              <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color, marginBottom: '0.35rem' }}>{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Pedidos en curso</h3>
            <button className="btn btn-secondary" style={{ fontSize: '0.82rem' }} onClick={() => navigate('/business/orders')}>
              Ver todos <ChevronRight size={14} />
            </button>
          </div>

          {loading ? <div className="loader">Cargando...</div>
          : activeOrders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>
              No hay pedidos activos
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {activeOrders.slice(0, 5).map(order => (
                <div key={order.id} className="order-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0077ff, #6d28d9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.78rem', fontWeight: 700, color: 'white', flexShrink: 0
                    }}>#{order.id}</div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Pedido #{order.id}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {order.items?.length || 0} items · ${order.total}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}
                      onClick={() => navigate('/business/orders')}>
                      Gestionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
