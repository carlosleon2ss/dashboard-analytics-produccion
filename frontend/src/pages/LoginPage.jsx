import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login, register }     = useAuth()
  const [isLogin, setIsLogin]   = useState(true)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm]         = useState({ name: '', email: '', password: '' })

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '40px', width: '100%', maxWidth: 400,
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #00d68f, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800,
          }}>P</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>PulseMetrics</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-sec)' }}>
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'var(--bg-card2)',
          borderRadius: 8, padding: 4, marginBottom: 24,
        }}>
          {['Iniciar sesión', 'Registrarse'].map((tab, i) => (
            <button key={tab} onClick={() => { setIsLogin(i === 0); setError('') }} style={{
              flex: 1, padding: '8px', borderRadius: 6, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: isLogin === (i === 0) ? 'var(--bg-card)' : 'transparent',
              color: isLogin === (i === 0) ? 'var(--text-pri)' : 'var(--text-sec)',
              transition: 'all 0.15s',
            }}>{tab}</button>
          ))}
        </div>

        {/* Campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>
                Nombre completo
              </label>
              <input
                name="name" value={form.name}
                onChange={handleChange} onKeyDown={handleKeyDown}
                placeholder="Juan Pérez"
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              name="email" type="email" value={form.email}
              onChange={handleChange} onKeyDown={handleKeyDown}
              placeholder="tu@email.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              name="password" type="password" value={form.password}
              onChange={handleChange} onKeyDown={handleKeyDown}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: 8, border: 'none',
              background: loading ? 'var(--bg-card2)' : 'var(--green)',
              color: loading ? 'var(--text-sec)' : '#000',
              fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 8, transition: 'all 0.15s',
            }}
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </div>

        {/* Credenciales de prueba */}
        {isLogin && (
          <div style={{
            marginTop: 24, padding: '12px', borderRadius: 8,
            background: 'var(--bg-card2)', border: '1px solid var(--border)',
            fontSize: 12, color: 'var(--text-sec)',
          }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text-pri)' }}>
              Cuenta de prueba:
            </p>
            <p style={{ margin: 0 }}>Email: <span className="mono">admin@dashboard.com</span></p>
            <p style={{ margin: 0 }}>Password: <span className="mono">admin1234</span></p>
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', background: 'var(--bg-card2)',
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '10px 14px', color: 'var(--text-pri)',
  fontSize: 13, outline: 'none', boxSizing: 'border-box',
  colorScheme: 'dark',
}