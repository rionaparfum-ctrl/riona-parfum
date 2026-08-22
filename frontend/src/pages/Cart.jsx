import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { collection, query, where, getDocs, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { FiTrash2, FiMinus, FiPlus, FiTag, FiGift, FiShoppingBag } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { db, WHATSAPP_NUMBER } from '@/firebase'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import { useToast } from '@/components/Toast'
import { formatAZN } from '@/lib/utils'

export default function Cart() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const { user, profile, refreshProfile } = useAuth()
  const { products } = useProducts()
  const cart = useCart()
  const {
    items, removeItem, updateQty, subtotal, hasBundle, bundleDiscount,
    promo, setPromo, promoDiscount, giftWrap, setGiftWrap, giftWrapFee,
    giftMessage, setGiftMessage, tester, setTester, testerEligible, total, clear,
  } = cart

  const [promoInput, setPromoInput] = useState('')
  const [customerName, setCustomerName] = useState(profile?.name || '')
  const [placing, setPlacing] = useState(false)

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    const q = query(collection(db, 'coupons'), where('code', '==', code), where('active', '==', true))
    const snap = await getDocs(q)
    if (snap.empty) {
      toast.error(t('cart.promoInvalid'))
      setPromo(null)
      return
    }
    const c = snap.docs[0].data()
    setPromo({ code, type: c.type, value: c.value })
    toast.success(t('cart.promoApplied'))
  }

  const buildWhatsAppMessage = () => {
    const lines = []
    lines.push('*RIONA PARFUM — Yeni Sifariş*')
    lines.push('')
    lines.push(`👤 Müştəri: ${customerName || '—'}`)
    lines.push('')
    lines.push('🛍️ *Məhsullar:*')
    items.forEach((i) => {
      lines.push(`• ${i.name} (${i.variantLabel}) x${i.qty} — ${formatAZN(i.price * i.qty)}`)
    })
    lines.push('')
    lines.push(`Ara cəm: ${formatAZN(subtotal)}`)
    if (hasBundle) lines.push(`Set endirimi (15%): -${formatAZN(bundleDiscount)}`)
    if (promo) lines.push(`Promokod (${promo.code}): -${formatAZN(promoDiscount)}`)
    if (tester) lines.push(`🎁 Pulsuz tester: ${tester}`)
    if (giftWrap) {
      lines.push(`🎀 Hədiyyə paketi: +${formatAZN(3)}`)
      if (giftMessage) lines.push(`💌 Təbrik: "${giftMessage}"`)
    }
    lines.push('')
    lines.push(`💰 *Yekun: ${formatAZN(total)}*`)
    return encodeURIComponent(lines.join('\n'))
  }

  const placeOrder = async () => {
    if (items.length === 0) return
    if (!customerName.trim()) {
      toast.error(t('cart.yourName'))
      return
    }
    setPlacing(true)
    try {
      const orderData = {
        uid: user?.uid || null,
        customerName: customerName.trim(),
        items: items.map((i) => ({ name: i.name, variantLabel: i.variantLabel, price: i.price, qty: i.qty, productId: i.productId, imageUrl: i.imageUrl || null })),
        subtotal,
        bundleDiscount,
        promoCode: promo?.code || null,
        promoDiscount,
        tester: tester || null,
        giftWrap,
        giftMessage: giftMessage || null,
        total,
        status: 'new',
        createdAt: serverTimestamp(),
      }
      await addDoc(collection(db, 'orders'), orderData)

      if (user) {
        const earned = Math.round(total * 0.05 * 100) / 100
        await updateDoc(doc(db, 'users', user.uid), { points: increment(earned) })
        await refreshProfile()
        toast.success(`Sifariş qeydə alındı! +${earned} bal qazandınız`)
      } else {
        toast.success('Sifariş qeydə alındı!')
      }

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`
      clear()
      window.open(url, '_blank')
      navigate('/')
    } catch (e) {
      toast.error('Xəta baş verdi: ' + e.message)
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 text-center">
        <FiShoppingBag className="mx-auto text-5xl text-gold/40 mb-4" />
        <p className="text-neutral-400 text-lg">{t('cart.empty')}</p>
        <Link to="/catalog" className="btn-gold rounded-full px-8 py-3 inline-block mt-6">{t('cart.continue')}</Link>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="font-serif text-4xl text-white mb-8">{t('cart.title')}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {hasBundle && (
              <div className="glass rounded-xl px-4 py-3 text-sm text-gold border-gold/30 flex items-center gap-2" data-testid="bundle-banner">
                <FiTag /> Set yaratdınız! 15% endirim tətbiq olundu 🎉
              </div>
            )}
            {items.map((i) => (
              <motion.div key={i.key} layout className="glass-light rounded-2xl p-4 flex gap-4 border border-white/5" data-testid={`cart-item-${i.productId}`}>
                <img src={i.imageUrl} alt={i.name} className="w-20 h-24 object-cover rounded-xl bg-black" />
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-gold/70">{i.brand}</div>
                  <h3 className="font-serif text-lg text-white">{i.name}</h3>
                  <div className="text-xs text-neutral-400">{i.variantLabel}</div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 glass rounded-full px-2 py-1">
                      <button onClick={() => updateQty(i.key, i.qty - 1)} className="w-7 h-7 flex items-center justify-center text-gold"><FiMinus className="text-xs" /></button>
                      <span className="w-6 text-center text-sm text-white">{i.qty}</span>
                      <button onClick={() => updateQty(i.key, i.qty + 1)} className="w-7 h-7 flex items-center justify-center text-gold"><FiPlus className="text-xs" /></button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gold font-semibold">{formatAZN(i.price * i.qty)}</span>
                      <button onClick={() => removeItem(i.key)} className="text-neutral-500 hover:text-red-400 transition-colors" data-testid={`remove-item-${i.productId}`}><FiTrash2 /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Tester */}
            {testerEligible && (
              <div className="glass rounded-2xl p-5 border-gold/30" data-testid="tester-section">
                <div className="flex items-center gap-2 text-gold mb-3"><FiGift /> {t('cart.tester')}</div>
                <select
                  value={tester || ''}
                  onChange={(e) => setTester(e.target.value || null)}
                  className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold"
                  data-testid="tester-select"
                >
                  <option value="">— {t('cart.chooseTester')} —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Gift wrap */}
            <div className="glass rounded-2xl p-5">
              <label className="flex items-center gap-3 cursor-pointer" data-testid="giftwrap-toggle">
                <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="w-5 h-5 accent-[#D4AF37]" />
                <FiGift className="text-gold" />
                <span className="text-sm text-neutral-200">{t('cart.giftWrap')}</span>
              </label>
              {giftWrap && (
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder={t('cart.giftMsg')}
                  rows={2}
                  className="mt-3 w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold resize-none"
                  data-testid="gift-message"
                />
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glass rounded-2xl p-6 space-y-4">
              {/* Promo */}
              <div>
                <div className="text-xs tracking-widest uppercase text-gold/70 mb-2">{t('cart.promo')}</div>
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="RIONA10"
                    className="flex-1 bg-charcoal border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-gold uppercase"
                    data-testid="promo-input"
                  />
                  <button onClick={applyPromo} className="btn-outline-gold rounded-xl px-4 text-sm" data-testid="promo-apply">{t('cart.apply')}</button>
                </div>
              </div>

              <div className="hairline" />

              <Row label={t('cart.subtotal')} value={formatAZN(subtotal)} />
              {hasBundle && <Row label={t('cart.bundle')} value={`-${formatAZN(bundleDiscount)}`} gold />}
              {promo && <Row label={`${t('cart.discount')} (${promo.code})`} value={`-${formatAZN(promoDiscount)}`} gold />}
              {giftWrap && <Row label={t('cart.giftWrap')} value={`+${formatAZN(giftWrapFee)}`} />}
              {tester && <Row label="Tester" value={tester} gold />}

              <div className="hairline" />
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">{t('cart.total')}</span>
                <span className="font-serif text-3xl gold-text" data-testid="cart-total">{formatAZN(total)}</span>
              </div>

              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('cart.yourName')}
                className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold"
                data-testid="customer-name"
              />

              <button
                onClick={placeOrder}
                disabled={placing}
                className="btn-gold w-full rounded-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="checkout-whatsapp"
              >
                <FaWhatsapp className="text-lg" /> {placing ? '...' : t('cart.checkout')}
              </button>

              {!user && (
                <p className="text-xs text-center text-neutral-500">
                  <Link to="/auth" className="text-gold">{t('auth.register')}</Link> — hər sifarişdən 5% cashback qazanın
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, gold }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className={gold ? 'text-gold' : 'text-white'}>{value}</span>
    </div>
  )
}
