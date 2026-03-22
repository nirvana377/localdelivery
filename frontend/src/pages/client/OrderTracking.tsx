import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, ChefHat, Package, Bike, MapPin, PartyPopper, CheckCircle2 } from 'lucide-react';
import { orderService } from '../../services/api';
import { connectSocket, disconnectSocket } from '../../services/socket';
import type { Order } from '../../types';

const statusSteps = [
  { key: 'pending',    label: 'Pedido recibido',  icon: <ClipboardList size={18} /> },
  { key: 'confirmed',  label: 'Confirmado',        icon: <CheckCircle2 size={18} /> },
  { key: 'preparing',  label: 'En preparación',   icon: <ChefHat size={18} /> },
  { key: 'ready',      label: 'Listo para envío', icon: <Package size={18} /> },
  { key: 'picked_up',  label: 'Recogido',          icon: <Bike size={18} /> },
  { key: 'on_the_way', label: 'En camino',         icon: <MapPin size={18} /> },
  { key: 'delivered',  label: 'Entregado',         icon: <PartyPopper size={18} /> },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    orderService.getById(Number(orderId)).then(res => setOrder(res.data));
    const socket = connectSocket(`order_${orderId}`);
    socket.on('order_status_updated', (updated: Order) => setOrder(updated));
    socket.on('rider_location_updated', (data: any) => setRiderLocation({ lat: data.lat, lng: data.lng }));
    return () => disconnectSocket();
  }, [orderId]);

  const currentIdx = statusSteps.findIndex(s => s.key === order?.status);

  if (!order) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Cargando pedido...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <button className="btn btn-secondary" onClick={() => navigate('/orders')}><ArrowLeft size={16} /> Mis Pedidos</button>
        <span className="navbar-brand">Seguimiento</span>
        <div />
      </nav>

      <div className="page" style={{ maxWidth: '680px' }}>
        {/* Estado actual */}
        <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '2.5rem',
          background: order.status === 'delivered' ? 'rgba(16,185,129,0.06)' : 'var(--bg-card)',
          borderColor: order.status === 'delivered' ? 'rgba(16,185,129,0.3)' : 'var(--border)'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1.25rem',
            background: 'linear-gradient(135deg, #0077ff, #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,119,255,0.3)', color: 'white'
          }}>
            {statusSteps[currentIdx]?.icon}
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '0.4rem' }}>
            {statusSteps[currentIdx]?.label || 'Procesando'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Pedido #{order.id}</p>
          <p style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.25rem', marginTop: '0.75rem', fontFamily: 'Syne, sans-serif' }}>
            ${order.total}
          </p>
        </div>

        {/* Timeline */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Syne, sans-serif' }}>Estado del pedido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {statusSteps.map((step, idx) => {
              const done = idx <= currentIdx;
              const current = idx === currentIdx;
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={`step-dot ${done ? 'active' : 'inactive'}`}>
                    <span style={{ color: done ? 'white' : 'var(--text-muted)' }}>{step.icon}</span>
                  </div>
                  <span style={{ color: done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: current ? 600 : 400, fontSize: '0.9rem' }}>
                    {step.label}
                  </span>
                  {current && (
                    <span style={{
                      marginLeft: 'auto', background: 'rgba(0,119,255,0.15)',
                      color: '#60a5fa', padding: '0.15rem 0.6rem',
                      borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em'
                    }}>ACTUAL</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ubicación repartidor */}
        {riderLocation && (
          <div className="card">
            <h3 style={{ marginBottom: '0.75rem', fontFamily: 'Syne, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--accent-cyan)" /> Repartidor en camino
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Lat: {riderLocation.lat.toFixed(5)} · Lng: {riderLocation.lng.toFixed(5)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
