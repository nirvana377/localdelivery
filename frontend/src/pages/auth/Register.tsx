import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Bike, Store, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roles = [
  { value: 'client', label: 'Cliente', icon: <User size={18} />, desc: 'Pide comida a domicilio' },
  { value: 'business', label: 'Negocio', icon: <Store size={18} />, desc: 'Gestiona tu restaurante' },
  { value: 'rider', label: 'Repartidor', icon: <Bike size={18} />, desc: 'Realiza entregas' },
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(109,40,217,0.12), transparent)',
      padding: '2rem 1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #0077ff, #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(109,40,217,0.3)'
          }}>
            <Bike size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Crear cuenta
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>Únete a Local Delivery</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px',
              marginBottom: '1.25rem', fontSize: '0.875rem'
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label className="label">Nombre completo</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" placeholder="Tu nombre" style={{ paddingLeft: '2.5rem' }}
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="label">Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type="email" placeholder="tu@email.com" style={{ paddingLeft: '2.5rem' }}
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type="password" placeholder="••••••••" style={{ paddingLeft: '2.5rem' }}
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="label">Tipo de cuenta</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                {roles.map(r => (
                  <button key={r.value} type="button"
                    onClick={() => setRole(r.value)}
                    style={{
                      padding: '0.8rem 0.5rem', borderRadius: '10px', border: '1px solid',
                      borderColor: role === r.value ? '#0077ff' : 'var(--border)',
                      background: role === r.value ? 'rgba(0,119,255,0.1)' : 'var(--bg-secondary)',
                      color: role === r.value ? '#60a5fa' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'all 0.18s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600
                    }}>
                    {r.icon}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', marginTop: '0.5rem' }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creando...</> : <>Crear Cuenta <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
