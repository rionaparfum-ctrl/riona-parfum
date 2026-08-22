import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { FiAward, FiLogOut, FiRepeat, FiPackage, FiUser } from 'react-icons/fi'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/Toast'
import { formatAZN } from '@/lib/utils'

export default function Account() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, profile, logout, isAdmin } = useAuth()
  const { addItem } = useCart()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const q = query(collection(db, 'orders'), where('uid', '==', user.uid))
        const snap = await getDocs(q)
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setOrders(data)
      } catch (e) {
        /* ignore */
      }
      setLoading(false)
    })()
  }, [user])

  const reorder = (order) => {
    order.items.forEach((it) => {
      addItem(
        { id: it.productId, name: it.name, imageUrl: it.imageUrl, brand: '' },
        { label: it.variantLabel, price: it.price },
        it.qty,
      )
    })
    toast.success('Məhsullar səbətə əlavə olundu')
    navigate('/cart')
  }

  const doLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-4xl text-white">{t('account.title')}</h1>
          <button onClick={doLogout} className="btn-outline-gold rounded-full px-5 py-2.5 flex items-center gap-2 text-sm" data-testid="logout-btn">
            <FiLogOut /> {t('auth.logout')}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 md:col-span-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 text-gold text-2xl"><FiUser /></span>
              <div>
                <div className="text-white font-serif text-xl">{profile?.name}</div>
                <div className="text-sm text-neutral-400">{profile?.email}</div>
              </div>
            </div>
            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="btn-gold rounded-full px-5 py-2 text-sm mt-5" data-testid="goto-admin">
                {t('nav.admin')} →
              </button>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 text-center">
            <FiAward className="mx-auto text-3xl text-gold mb-2" />
            <div className="text-3xl font-serif gold-text" data-testid="cashback-points">{(profile?.points || 0).toFixed(2)}</div>
            <div className="text-sm text-neutral-300 mt-1">{t('account.points')}</div>
            <div className="text-xs text-neutral-500 mt-2">{t('account.pointsHint')}</div>
          </motion.div>
        </div>

        <h2 className="font-serif text-2xl text-white mb-5 flex items-center gap-2"><FiPackage className="text-gold" /> {t('account.orders')}</h2>

        {loading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin-slow" /></div>
        ) : orders.length === 0 ? (
          <div className="glass-light rounded-2xl p-10 text-center text-neutral-400">{t('account.noOrders')}</div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="glass-light rounded-2xl p-5 border border-white/5" data-testid={`order-${o.id}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-xs text-neutral-500">{t('account.orderDate')}</div>
                    <div className="text-sm text-white">
                      {o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString('az-AZ') : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">{t('account.items')}</div>
                    <div className="text-sm text-white">{o.items?.length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">{t('account.orderTotal')}</div>
                    <div className="text-gold font-semibold">{formatAZN(o.total)}</div>
                  </div>
                  <button onClick={() => reorder(o)} className="btn-outline-gold rounded-full px-4 py-2 text-sm flex items-center gap-2" data-testid={`reorder-${o.id}`}>
                    <FiRepeat /> {t('account.reorder')}
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  {o.items?.map((it, idx) => (
                    <span key={idx} className="text-xs text-neutral-400 bg-white/5 rounded-full px-3 py-1">
                      {it.name} · {it.variantLabel} × {it.qty}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
