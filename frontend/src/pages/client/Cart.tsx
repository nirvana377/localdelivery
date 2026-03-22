import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, X, MapPin, CreditCard, Banknote, Building2, Loader2, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/api';

const paymentMethods = [
  { value: 'cash', label: 'Efectivo', icon: <Banknote size={16} /> },
  { value: 'card', label: 'Tarjeta', icon: <CreditCard size={16} /> },
  { value: 'transfer', label: 'Transferencia', icon: <Building2 size={16} /> },
];

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOrder = async () => {
    if (!address) return alert('Ingresa tu dirección de entrega');
    setLoading(true);
    try {
      const res = await orderService.create({
        items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
        delivery_address: address,
        payment_method: paymentMethod
      });
      clearCart();
      navigate(`/tracking/${res.data.id}`);
    } catch { alert('Error al crear el pedido'); }
    finally { setLoading(false); }
  };

  if (items.length === 0) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <button className="btn btn-secondary" onClick={() => navigate('/menu')}><ArrowLeft size={16} /> Volver</button>
        <span className="navbar-brand">Carrito</span>
        <div />
      </nav>
      <div className="empty-state">
        <ShoppingCart size={52} />
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos del menú para continuar</p>
        <button className="btn btn-primary" onClick={() => navigate('/menu')}>Ver Menú</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <button className="btn btn-secondary" onClick={() => navigate('/menu')}><ArrowLeft size={16} /> Volver</button>
        <span className="navbar-brand">Carrito</span>
        <div />
      </nav>

      <div className="page">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 370px', gap: '2rem' }}>
          {/* Items */}
          <div>
            <h2 style={{ marginBottom: '1.25rem', fontFamily: 'Syne, sans-serif' }}>Tu pedido</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map(item => (
                <div key={item.product.id} className="card"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <img src={item.product.image_url} alt={item.product.name}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                    onError={e => (e.currentTarget.style.display = 'none')} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem', fontFamily: 'Syne, sans-serif' }}>{item.product.name}</h4>
                    <p style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.9rem' }}>${item.product.price}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }}
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, minWidth: '22px', textAlign: 'center', fontFamily: 'Syne, sans-serif' }}>
                      {item.quantity}
                    </span>
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <span style={{ fontWeight: 700, minWidth: '64px', textAlign: 'right', fontFamily: 'Syne, sans-serif' }}>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <button className="btn btn-secondary" style={{ padding: '0.35rem' }}
                    onClick={() => removeItem(item.product.id)}>
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '80px' }}>
              <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Syne, sans-serif' }}>Resumen</h3>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label"><MapPin size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Dirección de entrega</label>
                <input className="input" placeholder="Calle Principal 123..."
                  value={address} onChange={e => setAddress(e.target.value)} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Método de pago</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {paymentMethods.map(pm => (
                    <button key={pm.value} type="button" onClick={() => setPaymentMethod(pm.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid',
                        borderColor: paymentMethod === pm.value ? '#0077ff' : 'var(--border)',
                        background: paymentMethod === pm.value ? 'rgba(0,119,255,0.08)' : 'var(--bg-secondary)',
                        color: paymentMethod === pm.value ? '#60a5fa' : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                        fontSize: '0.875rem', transition: 'all 0.18s'
                      }}>
                      {pm.icon} {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span>Subtotal</span><span>${total.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span>Envío</span><span style={{ color: 'var(--accent-green)' }}>Gratis</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'Syne, sans-serif' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleOrder} disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</> : <><Truck size={16} /> Confirmar Pedido</>}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
