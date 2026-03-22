import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, ImageOff } from 'lucide-react';
import { productService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types';

export default function Menu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [category, setCategory] = useState('Todo');
  const [loading, setLoading] = useState(true);
  const { addItem, itemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    productService.getAll().then(res => {
      setProducts(res.data);
      setFiltered(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setFiltered(category === 'Todo' ? products : products.filter(p => p.category === category));
  }, [category, products]);

  const categories = ['Todo', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <button className="btn btn-secondary" onClick={() => navigate('/home')}>
          <ArrowLeft size={16} /> Volver
        </button>
        <span className="navbar-brand">Menú</span>
        <button className="btn btn-secondary" onClick={() => navigate('/cart')} style={{ position: 'relative' }}>
          <ShoppingCart size={16} />
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </button>
      </nav>

      <div className="page">
        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '0.45rem 1.1rem', borderRadius: '20px',
              border: '1px solid', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.18s',
              borderColor: category === cat ? 'transparent' : 'var(--border)',
              background: category === cat ? 'linear-gradient(135deg, #0077ff, #6d28d9)' : 'var(--bg-card)',
              color: 'white',
            }}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loader">Cargando menú...</div>
        ) : (
          <div className="grid-3">
            {filtered.map(product => (
              <div key={product.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ position: 'relative', height: '180px', background: 'var(--bg-secondary)' }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <ImageOff size={32} color="var(--text-muted)" />
                    </div>
                  )}
                  <span style={{
                    position: 'absolute', top: '0.75rem', left: '0.75rem',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    padding: '0.2rem 0.6rem', borderRadius: '20px',
                    fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500
                  }}>{product.category}</span>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ marginBottom: '0.4rem', fontSize: '1rem', fontFamily: 'Syne, sans-serif' }}>{product.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {product.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.15rem', fontFamily: 'Syne, sans-serif' }}>
                      ${product.price}
                    </span>
                    <button className="btn btn-primary"
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                      onClick={() => addItem(product)}>
                      <Plus size={15} /> Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
