import React from 'react';
import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ChefHat, Package, Bike, UserCheck } from 'lucide-react';
import { orderService, deliveryService } from '../../services/api';
import { connectSocket, disconnectSocket } from '../../services/socket';
import type { Order } from '../../types';

const nextStatus: Record<string, string> = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'picked_up' };
const nextLabel: Record<string, { label: string; icon: React.ReactNode }> = {
  pending:   { label: 'Confirmar',       icon: <CheckCircle size={15} /> },
  confirmed: { label: 'Preparar',        icon: <ChefHat size={15} /> },
  preparing: { label: 'Marcar listo',    icon: <Package size={15} /> },
  ready:     { label: 'Asignar rider',   icon: <UserCheck size={15} /> },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    orderService.getAll().then(res => { setOrders(res.data); setLoading(false); });
    deliveryService.getRiders().then(res => setRiders(res.data));
    const socket = connectSocket('business');
    socket.on('order_received', (o: Order) => setOrders(prev => [o, ...prev]));
    socket.on('order_status_updated', (o: Order) => setOrders(prev => prev.map(x => x.id === o.id ? o : x)));
    return () => disconnectSocket();
  }, []);

  const handleUpdate = async (order: Order, riderId?: number) => {
    const next = nextStatus[order.status];
    if (!next) return;
    await orderService.updateStatus(order.id, next, riderId);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <button className="btn btn-secondary" onClick={() => navigate('/business')}><ArrowLeft size={16} /> Dashboard</button>
        <span className="navbar-brand">Gestión de Pedidos</span>
        <div />
      </nav>

      <div className="page">
        {loading ? <div className="loader">Cargando pedidos...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '0.3rem' }}>Pedido #{order.id}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                      {order.delivery_address} · {order.payment_method}
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
                      {item.quantity}× {item.name} — ${item.unit_price}
                    </p>
                  ))}
                </div>

                {nextStatus[order.status] && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {order.status === 'ready' ? (
                      <select className="input" style={{ maxWidth: '220px' }}
                        onChange={e => e.target.value && handleUpdate(order, Number(e.target.value))}>
                        <option value="">Seleccionar repartidor</option>
                        {riders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    ) : (
                      <button className="btn btn-primary" onClick={() => handleUpdate(order)}>
                        {nextLabel[order.status]?.icon} {nextLabel[order.status]?.label}
                      </button>
                    )}
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)', fontSize: '0.875rem' }}>
                    <Bike size={16} /> Entregado exitosamente
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

