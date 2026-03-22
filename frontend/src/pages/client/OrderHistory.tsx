import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, ChevronRight } from 'lucide-react';
import { orderService } from '../../services/api';
import type { Order } from '../../types';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    orderService.getAll()
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <button className="btn btn-secondary" onClick={() => navigate('/home')}><ArrowLeft size={16} /> Volver</button>
        <span className="navbar-brand">Mis Pedidos</span>
        <div />
      </nav>

      <div className="page" style={{ maxWidth: '700px' }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Syne, sans-serif' }}>Historial</h2>

        {loading ? (
          <div className="loader">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={52} />
            <h3>Sin pedidos aún</h3>
            <p>Haz tu primer pedido ahora</p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')}>Ver Menú</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {orders.map(order => (
              <div key={order.id} className="card" style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/tracking/${order.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '0.25rem' }}>Pedido #{order.id}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(order.created_at).toLocaleDateString('es', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                  {order.items?.map((item, i) => (
                    <p key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                      {item.quantity}× {item.name} — ${item.unit_price}
                    </p>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{order.delivery_address}</p>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>
                    ${order.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
