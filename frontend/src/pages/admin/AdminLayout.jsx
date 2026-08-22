import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiGrid, FiBox, FiTag, FiShoppingBag, FiLogOut, FiExternalLink } from 'react-icons/fi'
import Logo from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout, profile } = useAuth()

  const links = [
    { to: '/admin', icon: <FiGrid />, label: t('admin.dashboard'), end: true },
    { to: '/admin/products', icon: <FiBox />, label: t('admin.products') },
    { to: '/admin/coupons', icon: <FiTag />, label: t('admin.coupons') },
    { to: '/admin/orders', icon: <FiShoppingBag />, label: t('admin.orders') },
  ]

  const doLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-ink flex noise">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 glass border-r border-gold/10 flex flex-col p-3 md:p-5 sticky top-0 h-screen">
        <div className="mb-8 hidden md:block"><Logo /></div>
        <div className="mb-8 md:hidden flex justify-center"><Logo compact /></div>
        <nav className="flex-1 space-y-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              data-testid={`admin-nav-${l.label}`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                  isActive ? 'bg-gold/15 text-gold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="text-lg">{l.icon}</span>
              <span className="hidden md:inline">{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 pt-4 border-t border-white/5">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-neutral-400 hover:text-gold transition-colors">
            <FiExternalLink className="text-lg" /> <span className="hidden md:inline">Sayta bax</span>
          </button>
          <button onClick={doLogout} data-testid="admin-logout" className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-neutral-400 hover:text-red-400 transition-colors">
            <FiLogOut className="text-lg" /> <span className="hidden md:inline">{t('admin.logoutAdmin')}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="p-5 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
