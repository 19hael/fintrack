import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-4xl flex gap-8 items-center">
        {/* Left: Branding Card */}
        <div className="hidden lg:flex flex-col items-center justify-center glass-card p-10 w-[400px] h-[480px] relative overflow-hidden">
          {/* Globe illustration */}
          <div className="relative w-44 h-44 mb-8">
            <div className="absolute inset-0 rounded-full" style={{
              background: 'radial-gradient(circle at 35% 35%, rgba(60, 55, 70, 0.35), rgba(25, 22, 35, 0.5) 50%, rgba(10, 10, 18, 0.75))',
              boxShadow: 'inset -15px -15px 30px rgba(0,0,0,0.5), inset 8px 8px 20px rgba(200, 165, 90, 0.05), 0 0 40px rgba(200, 165, 90, 0.04)',
            }} />
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-15">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(0deg, transparent 48%, rgba(200,170,110,0.3) 49%, rgba(200,170,110,0.3) 51%, transparent 52%),
                  linear-gradient(90deg, transparent 48%, rgba(200,170,110,0.2) 49%, rgba(200,170,110,0.2) 51%, transparent 52%)
                `,
                backgroundSize: '22px 22px',
              }} />
            </div>
            {/* Orbit ring */}
            <div className="absolute" style={{
              top: '50%', left: '-30%', width: '160%', height: '75px',
              border: '1px solid rgba(200, 170, 110, 0.08)',
              borderRadius: '50%',
              transform: 'translateY(-50%) rotateX(75deg) rotateZ(-20deg)',
              animation: 'orbit-ring 22s linear infinite',
            }} />
            <div className="absolute" style={{
              top: '50%', left: '-40%', width: '180%', height: '95px',
              border: '1px solid rgba(200, 170, 110, 0.04)',
              borderRadius: '50%',
              transform: 'translateY(-50%) rotateX(70deg) rotateZ(-30deg)',
              animation: 'orbit-ring 32s linear infinite reverse',
            }} />
            {/* Mini planets */}
            <div className="absolute" style={{
              width: '14px', height: '14px',
              top: '-6px', right: '22px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 30%, rgba(200, 165, 90, 0.5), rgba(120, 90, 40, 0.6))',
              boxShadow: '0 0 8px rgba(200, 165, 90, 0.1)',
              animation: 'float-tiny 10s ease-in-out infinite',
            }} />
            <div className="absolute" style={{
              width: '10px', height: '10px',
              bottom: '12px', left: '-8px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 30%, rgba(160, 140, 180, 0.5), rgba(60, 50, 80, 0.6))',
              boxShadow: '0 0 6px rgba(160, 140, 180, 0.08)',
              animation: 'float-small 12s ease-in-out infinite',
            }} />
          </div>

          {/* Branding */}
          <div className="flex items-center gap-2.5 mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#lgStar)" opacity="0.85"/>
              <defs>
                <linearGradient id="lgStar" x1="12" y1="2" x2="12" y2="22">
                  <stop offset="0%" stopColor="#D4A853"/>
                  <stop offset="100%" stopColor="#B8922F"/>
                </linearGradient>
              </defs>
            </svg>
            <h1 className="text-2xl font-semibold tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span style={{ color: '#C8A55A' }}>Fin</span><span className="text-text-primary">Track</span>
            </h1>
          </div>
          <p className="text-text-secondary text-center text-sm leading-relaxed max-w-[260px]" style={{ fontWeight: 300 }}>
            Su Navegación Financiera Estelar.<br />
            Trace su futuro con precisión.
          </p>

          {/* Decorative corners */}
          <div className="absolute top-4 left-4 text-text-muted text-[9px] font-mono opacity-30 tracking-wider">
            <span>• 0.025</span>
            <span className="ml-2.5">0.0065</span>
          </div>
          <div className="absolute bottom-4 right-4 text-text-muted text-[9px] font-mono opacity-30">
            30160
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="flex-1 max-w-md">
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(200, 165, 90, 0.2), transparent)'
            }} />

            <div className="text-center mb-8">
              <p className="text-xs text-text-muted uppercase tracking-[0.25em] mb-2" style={{ fontWeight: 400 }}>Bienvenido a</p>
              <h2 className="text-2xl font-semibold tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span style={{ color: '#C8A55A' }}>Fin</span><span className="text-text-primary">Track</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full input-cosmic rounded-xl pl-11 pr-4 py-3 text-[13px]"
                  placeholder="Correo electrónico"
                  required
                />
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full input-cosmic rounded-xl pl-11 pr-11 py-3 text-[13px]"
                  placeholder="Contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.4}>
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-[11px] text-text-muted hover:text-accent-gold transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-accent-expense text-[13px] p-3 rounded-xl" style={{
                  background: 'rgba(248, 113, 113, 0.06)',
                  border: '1px solid rgba(248, 113, 113, 0.1)'
                }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl text-[13px] tracking-[0.1em] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  'INICIAR SESIÓN'
                )}
              </button>
            </form>

            <p className="text-center text-text-muted text-[11px] mt-6 leading-relaxed">
              ¿No tienes cuenta? <span className="text-text-secondary">Contacta a tu administrador.</span>
            </p>

            {/* Constellation decoration */}
            <div className="absolute top-3 right-3 opacity-15">
              <svg width="45" height="45" viewBox="0 0 50 50" fill="none">
                <circle cx="10" cy="10" r="1.5" fill="#C8A55A" />
                <circle cx="30" cy="5" r="1" fill="#C8A55A" />
                <circle cx="45" cy="15" r="1.5" fill="#C8A55A" />
                <circle cx="35" cy="30" r="1" fill="#C8A55A" />
                <circle cx="20" cy="25" r="1" fill="#9AAFC4" />
                <line x1="10" y1="10" x2="30" y2="5" stroke="rgba(200,165,90,0.2)" strokeWidth="0.5" />
                <line x1="30" y1="5" x2="45" y2="15" stroke="rgba(200,165,90,0.2)" strokeWidth="0.5" />
                <line x1="45" y1="15" x2="35" y2="30" stroke="rgba(200,165,90,0.2)" strokeWidth="0.5" />
                <line x1="20" y1="25" x2="35" y2="30" stroke="rgba(154,175,196,0.15)" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}