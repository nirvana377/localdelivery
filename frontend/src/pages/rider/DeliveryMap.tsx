import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, NavigationOff, MapPin, Store, Home, Bike } from 'lucide-react';
import { deliveryService, orderService } from '../../services/api';
import { connectSocket, disconnectSocket } from '../../services/socket';
import type { Order } from '../../types';

export default function DeliveryMap() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    orderService.getById(Number(orderId)).then(res => setOrder(res.data));
    const socket = connectSocket('rider');
    return () => {
      disconnectSocket();
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [orderId]);

  const startTracking = () => {
    if (!navigator.geolocation) return alert('Geolocalización no disponible');
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        deliveryService.updateLocation(Number(orderId), lat, lng);
      },
      err => console.error('GPS error:', err),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const stopTracking = () => {
    setTracking(false);
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <button className="btn btn-secondary" onClick={() => navigate('/rider')}>
          <ArrowLeft size={16} /> Volver
        </button>
        <span className="navbar-brand">Mapa de entrega</span>
        <div />
      </nav>

      <div className="page" style={{ maxWidth: '700px' }}>
        {/* Info del pedido */}
        {order && (
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '0.75rem' }}>Pedido #{order.id}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} color="var(--accent-cyan)" />
                Entregar en: <strong style={{ color: 'var(--text-primary)' }}>{order.delivery_address}</strong>
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Total: <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'Syne, sans-serif' }}>${order.total}</strong>
              </p>
            </div>
          </div>
        )}

        {/* GPS Control */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={18} color="var(--accent-cyan)" /> Compartir ubicación
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Activa el tracking para que el cliente vea tu posición en tiempo real.
          </p>

          {location && (
            <div style={{
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem'
            }}>
              <p style={{ color: 'var(--accent-green)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                GPS activo
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            </div>
          )}

          {!tracking ? (
            <button className="btn btn-primary" onClick={startTracking}>
              <Navigation size={16} /> Iniciar tracking
            </button>
          ) : (
            <button className="btn btn-danger" onClick={stopTracking}>
              <NavigationOff size={16} /> Detener tracking
            </button>
          )}
        </div>

        {/* Mapa simulado */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Ruta de entrega</h3>
          </div>
          <div className="map-grid" style={{
            height: '320px', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {/* Negocio pin */}
            <div style={{ position: 'absolute', top: '28%', left: '22%', textAlign: 'center' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 6px rgba(249,115,22,0.15), 0 4px 16px rgba(249,115,22,0.4)',
                color: 'white', margin: '0 auto'
              }}>
                <Store size={20} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.3rem', fontWeight: 600 }}>Negocio</p>
            </div>

            {/* Repartidor pin — solo si tracking activo */}
            {location && (
              <div style={{ position: 'absolute', top: '44%', left: '48%', textAlign: 'center' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0077ff, #6d28d9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 6px rgba(0,119,255,0.15), 0 4px 16px rgba(0,119,255,0.4)',
                  color: 'white', margin: '0 auto'
                }}>
                  <Bike size={20} />
                </div>
                <p style={{ color: 'var(--accent-cyan)', fontSize: '0.72rem', marginTop: '0.3rem', fontWeight: 600 }}>Tú</p>
              </div>
            )}

            {/* Cliente pin */}
            <div style={{ position: 'absolute', top: '54%', right: '18%', textAlign: 'center' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 6px rgba(16,185,129,0.15), 0 4px 16px rgba(16,185,129,0.4)',
                color: 'white', margin: '0 auto'
              }}>
                <Home size={20} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.3rem', fontWeight: 600 }}>Cliente</p>
            </div>

            {!location && (
              <div style={{ textAlign: 'center', zIndex: 1 }}>
                <Navigation size={28} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Activa el tracking para ver tu posición
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
