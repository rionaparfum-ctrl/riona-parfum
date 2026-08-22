import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { collection, onSnapshot } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { FiDollarSign, FiShoppingBag, FiUsers, FiBox } from 'react-icons/fi'
import { db } from '@/firebase'
import { formatAZN } from '@/lib/utils'

export default function Dashboard() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState(0)
  const [products, setProducts] = useState(0)

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'orders'), (s) => setOrders(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
    const u2 = onSnapshot(collection(db, 'users'), (s) => setUsers(s.size))
    const u3 = onSnapshot(collection(db, 'products'), (s) => setProducts(s.size))
    return () => { u1(); u2(); u3() }
  }, [])

  const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0)
  const recent = [...orders].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 8)

  const stats = [
    { icon: <FiDollarSign />, label: t('admin.revenue'), value: formatAZN(revenue), testid: 'stat-revenue' },
    { icon: <FiShoppingBag />, label: t('admin.totalOrders'), value: orders.length, testid: 'stat-orders' },
    { icon: <FiUsers />, label: t('admin.totalUsers'), value: users, testid: 'stat-users' },
    { icon: <FiBox />, label: t('admin.totalProducts'), value: products, testid: 'stat-products' },
  ]

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl text-white mb-8">{t('admin.dashboard')}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5" data-testid={s.testid}>
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-gold/10 text-gold text-xl mb-4">{s.icon}</span>
            <div className="text-2xl font-serif text-white">{s.value}</div>
            <div className="text-sm text-neutral-400 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <h2 className="font-serif text-2xl text-white mb-4">{t('admin.orders')}</h2>
      <div className="glass rounded-2xl overflow-hidden">
        {recent.length === 0 ? (
          <div className="p-10 text-center text-neutral-400">{t('account.noOrders')}</div>
        ) : (
          <div className="divide-y divide-white/5">
            {recent.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-4 gap-4">
                <div className="min-w-0">
                  <div className="text-white text-sm truncate">{o.customerName || 'Qonaq'}</div>
                  <div className="text-xs text-neutral-500">{o.items?.length} məhsul · {o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString('az-AZ') : '—'}</div>
                </div>
                <div className="text-gold font-semibold whitespace-nowrap">{formatAZN(o.total)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
