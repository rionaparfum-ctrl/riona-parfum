import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi'
import { db } from '@/firebase'
import { useToast } from '@/components/Toast'

export default function AdminCoupons() {
  const { t } = useTranslation()
  const toast = useToast()
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState({ code: '', type: 'percent', value: '' })

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coupons'), (s) => setCoupons(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
    return () => unsub()
  }, [])

  const create = async (e) => {
    e.preventDefault()
    const code = form.code.trim().toUpperCase()
    if (!code || !form.value) return
    try {
      await addDoc(collection(db, 'coupons'), {
        code, type: form.type, value: Number(form.value), active: true, createdAt: serverTimestamp(),
      })
      setForm({ code: '', type: 'percent', value: '' })
      toast.success('Promokod yaradıldı')
    } catch (err) {
      toast.error('Xəta: ' + err.message)
    }
  }

  const toggle = (c) => updateDoc(doc(db, 'coupons', c.id), { active: !c.active })
  const remove = (id) => deleteDoc(doc(db, 'coupons', id))

  const input = 'w-full bg-charcoal border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-gold'

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl text-white mb-8">{t('admin.coupons')}</h1>

      <form onSubmit={create} className="glass rounded-2xl p-6 mb-8 grid sm:grid-cols-4 gap-3 items-end">
        <div className="sm:col-span-1">
          <label className="text-xs text-gold/70 uppercase tracking-widest mb-1.5 block">{t('admin.code')}</label>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="RIONA10" className={`${input} uppercase`} data-testid="coupon-code" />
        </div>
        <div>
          <label className="text-xs text-gold/70 uppercase tracking-widest mb-1.5 block">{t('admin.type')}</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={input} data-testid="coupon-type">
            <option value="percent">Faiz (%)</option>
            <option value="fixed">Sabit (₼)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gold/70 uppercase tracking-widest mb-1.5 block">{t('admin.value')}</label>
          <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} type="number" step="0.01" placeholder={form.type === 'percent' ? '10' : '5'} className={input} data-testid="coupon-value" />
        </div>
        <button type="submit" className="btn-gold rounded-full py-2.5 flex items-center justify-center gap-2" data-testid="create-coupon"><FiPlus /> {t('admin.newCoupon')}</button>
      </form>

      {coupons.length === 0 ? (
        <div className="glass-light rounded-2xl p-12 text-center text-neutral-400">Promokod yoxdur</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-5" data-testid={`coupon-${c.code}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-gold">
                    <FiTag />
                    <span className="font-mono text-lg tracking-wider">{c.code}</span>
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">
                    {c.type === 'percent' ? `${c.value}% endirim` : `${c.value} ₼ endirim`}
                  </div>
                </div>
                <button onClick={() => remove(c.id)} className="text-neutral-500 hover:text-red-400 transition-colors" data-testid={`delete-coupon-${c.code}`}><FiTrash2 /></button>
              </div>
              <button
                onClick={() => toggle(c)}
                data-testid={`toggle-coupon-${c.code}`}
                className={`mt-4 w-full rounded-full py-2 text-sm transition-all ${c.active ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30' : 'bg-white/5 text-neutral-400 border border-white/10'}`}
              >
                {c.active ? 'Aktiv ✓' : 'Deaktiv'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
