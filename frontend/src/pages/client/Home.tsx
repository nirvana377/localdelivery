import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ClipboardList, LogOut, Utensils, Coffee, Cake, Zap, Star, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const categories = [
  { icon: <Utensils size={32} />, label: 'Comida', color: '#f97316' },
  { icon: <Coffee size={32} />, label: 'Bebidas', color: '#8b5cf6' },
  { icon: <Cake size={32} />, label: 'Postres', color: '#ec4899' },
];

const stats = [
  { icon: <Zap size={22} />, value: '15 min', label: 'Tiempo promedio', color: 'var(--accent-cyan)' },
  { icon: <Star size={22} />, value: '4.8', label: 'Calificación', color: '#fbbf24' },
  { icon: <Clock size={22} />, value: '24/7', label: 'Disponible', color: 'var(--accent-green)' },
];

export default function Home() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <span className="navbar-brand">Local Delivery</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/orders')}>
            <ClipboardList size={16} /> Mis Pedidos
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/cart')}
            style={{ position: 'relative' }}>
            <ShoppingCart size={16} /> Carrito
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>
          <button className="btn btn-danger" onClick={logout} style={{ padding: '0.65rem' }}>
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        padding: '5rem 2rem 4rem',
        background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(0,119,255,0.1) 0%, rgba(109,40,217,0.06) 50%, transparent 100%)',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(0,194,255,0.1)', border: '1px solid rgba(0,194,255,0.2)',
          color: 'var(--accent-cyan)', padding: '0.4rem 1rem', borderRadius: '20px',
          fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.75rem', letterSpacing: '0.04em'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block' }} />
          IDEAL PARA TI
        </div>

        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '1.25rem'
        }}>
          Tu comida favorita<br />
          <span style={{ background: 'linear-gradient(135deg, #00c2ff, #6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            a domicilio
          </span>{' '}en minutos
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Hola, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>. Explora el menú y recibe tu pedido donde estés.
        </p>

        <button className="btn btn-primary" onClick={() => navigate('/menu')}
          style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
          <Utensils size={18} /> Ver Menú
        </button>
      </div>

      <div className="page">
        {/* Categorías */}
        <h2 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', fontFamily: 'Syne, sans-serif' }}>
          ¿Qué se te antoja?
        </h2>
        <div className="grid-3" style={{ marginBottom: '3rem' }}>
          {categories.map(cat => (
            <div key={cat.label} className="card" onClick={() => navigate('/menu')}
              style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ color: cat.color, marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                {cat.icon}
              </div>
              <p style={{ fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>{cat.label}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid-3">
          {stats.map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.75rem' }}>
              <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                {s.icon}
              </div>
              <div className="stat-value" style={{ color: s.color, marginBottom: '0.35rem' }}>{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
