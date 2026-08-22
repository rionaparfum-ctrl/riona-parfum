import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { formatAZN } from '@/lib/utils'

const STATUS = {
  new: { label: 'Yeni', cls: 'bg-gold/15 text-gold border-gold/30' },
  processing: { label: 'Hazırlanır', cls: 'bg-sky-500/15 text-sky-300 border-sky-400/30' },
  completed: { label: 'Tamamlandı', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' },
}

export default function AdminOrders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'orders'), (s) => {
      const data = s.docs.map((d) => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setOrders(data)
    })
    return () => unsub()
  }, [])

  const setStatus = (id, status) => updateDoc(doc(db, 'orders', id), { status })

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl text-white mb-8">{t('admin.orders')}</h1>

      {orders.length === 0 ? (
        <div className="glass-light rounded-2xl p-12 text-center text-neutral-400">{t('account.noOrders')}</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const st = STATUS[o.status] || STATUS.new
            return (
              <div key={o.id} className="glass rounded-2xl p-5" data-testid={`admin-order-${o.id}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-white font-medium">{o.customerName || 'Qonaq'}</div>
                    <div className="text-xs text-neutral-500">
                      {o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleString('az-AZ') : '—'}
                      {o.promoCode && ` · Promo: ${o.promoCode}`}
                      {o.tester && ` · Tester: ${o.tester}`}
                      {o.giftWrap && ' · 🎀 Hədiyyə paketi'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs rounded-full px-3 py-1 border ${st.cls}`}>{st.label}</span>
                    <span className="text-gold font-serif text-xl">{formatAZN(o.total)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  {o.items?.map((it, idx) => (
                    <span key={idx} className="text-xs text-neutral-300 bg-white/5 rounded-full px-3 py-1">
                      {it.name} · {it.variantLabel} × {it.qty} — {formatAZN(it.price * it.qty)}
                    </span>
                  ))}
                </div>
                {o.giftMessage && <div className="mt-2 text-xs text-neutral-400 italic">💌 "{o.giftMessage}"</div>}

                <div className="mt-4 flex gap-2">
                  {Object.keys(STATUS).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(o.id, s)}
                      data-testid={`order-status-${s}-${o.id}`}
                      className={`text-xs rounded-full px-3 py-1.5 border transition-all ${o.status === s ? STATUS[s].cls : 'border-white/10 text-neutral-400 hover:border-gold/40'}`}
                    >
                      {STATUS[s].label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
