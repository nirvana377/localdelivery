import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, ImageOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { productService } from '../../services/api';
import type { Product } from '../../types';

const emptyForm = { name: '', description: '', price: '', category: 'Comida', image_url: '', available: true };

export default function MenuManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const navigate = useNavigate();

  const load = () => productService.getAll().then(res => { setProducts(res.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price) };
    editing ? await productService.update(editing.id, data) : await productService.create(data);
    setShowForm(false); setEditing(null); setForm(emptyForm); load();
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, image_url: p.image_url, available: p.available });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este producto?')) { await productService.delete(id); load(); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="navbar">
        <button className="btn btn-secondary" onClick={() => navigate('/business')}><ArrowLeft size={16} /> Dashboard</button>
        <span className="navbar-brand">Gestión de Menú</span>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>
          <Plus size={16} /> Producto
        </button>
      </nav>

      <div className="page">
        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Syne, sans-serif' }}>
              {editing ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label className="label">Nombre</label>
                  <input className="input" placeholder="Pizza Especial"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Precio</label>
                  <input className="input" type="number" placeholder="120"
                    value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Descripción</label>
                <input className="input" placeholder="Descripción del producto"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label className="label">Categoría</label>
                  <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option>Comida</option><option>Bebidas</option><option>Postres</option>
                  </select>
                </div>
                <div>
                  <label className="label">URL de imagen</label>
                  <input className="input" placeholder="https://..."
                    value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button type="button" onClick={() => setForm({ ...form, available: !form.available })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: form.available ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                  {form.available ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {form.available ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" type="submit">
                  {editing ? 'Guardar cambios' : 'Crear producto'}
                </button>
                <button className="btn btn-secondary" type="button"
                  onClick={() => { setShowForm(false); setEditing(null); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? <div className="loader">Cargando productos...</div> : (
          <div className="grid-3">
            {products.map(p => (
              <div key={p.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ height: '150px', background: 'var(--bg-secondary)', position: 'relative' }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <ImageOff size={28} color="var(--text-muted)" />
                    </div>
                  )}
                  <span style={{
                    position: 'absolute', top: '0.6rem', right: '0.6rem',
                    padding: '0.15rem 0.55rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                    background: p.available ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: p.available ? '#34d399' : '#f87171',
                    border: `1px solid ${p.available ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                  }}>
                    {p.available ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.95rem' }}>{p.name}</h4>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>${p.price}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.75rem' }}>{p.category}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '0.4rem' }}
                      onClick={() => handleEdit(p)}>
                      <Pencil size={13} /> Editar
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.7rem', fontSize: '0.82rem' }}
                      onClick={() => handleDelete(p.id)}>
                      <Trash2 size={13} />
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
