import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  {
    path: '/dashboard',
    label: 'REPORTES',
  },
  {
    path: '/calendar',
    label: 'CALENDARIO',
  },
  {
    path: '/transactions',
    label: 'TRANSACCIONES',
  },
  {
    path: '/categories',
    label: 'CATEGORIAS',
  },
  {
    path: '/budget',
    label: 'PRESUPUESTO',
  },
  {
    path: '/settings',
    label: 'AJUSTES',
  },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-base-100 border-r border-border-strong flex flex-col z-50">
      {/* Logo */}
      <div className="p-8 border-b border-border-strong">
        <h1 className="text-display text-2xl tracking-tighter">
          FinTrack
        </h1>
        <p className="text-label text-text-disabled mt-1">SYS. V1.0</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors ${
                isActive
                  ? 'text-text-display bg-base-500 border border-border-strong'
                  : 'text-text-secondary hover:text-text-primary'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-6 border-t border-border-strong">
        <div className="mb-6">
          <p className="text-label">USER</p>
          <p className="font-sans text-sm text-text-primary truncate mt-1">
            {user?.email || 'OFFLINE'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-text-primary rounded-full"></div>
            <span className="text-label text-text-primary">ONLINE</span>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full text-left font-mono text-[11px] uppercase tracking-widest text-text-secondary hover:text-text-display transition-colors py-2"
        >
          [ CERRAR_SESION ]
        </button>
      </div>
    </aside>
  )
}