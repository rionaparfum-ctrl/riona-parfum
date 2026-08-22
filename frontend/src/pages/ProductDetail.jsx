import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingBag, FiMinus, FiPlus, FiEye, FiArrowLeft, FiZap } from 'react-icons/fi'
import { db } from '@/firebase'
import PerfumePyramid from '@/components/PerfumePyramid'
import MoodBadge from '@/components/MoodBadge'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useToast } from '@/components/Toast'
import { formatAZN } from '@/lib/utils'

export default function ProductDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()
  const toast = useToast()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(0)
  const [qty, setQty] = useState(1)
  const [viewToday, setViewToday] = useState(0)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      const ref = doc(db, 'products', id)
      const snap = await getDoc(ref)
      if (!active) return
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setProduct(data)
        setSelected(0)
        setQty(1)
        // FOMO: real view tracking
        const today = new Date().toISOString().slice(0, 10)
        const newToday = data.viewDay === today ? (data.viewToday || 0) + 1 : 1
        setViewToday(newToday)
        try {
          await updateDoc(ref, { views: increment(1), viewDay: today, viewToday: newToday })
        } catch {
          /* ignore */
        }
      } else {
        setProduct(null)
      }
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin-slow" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pt-32 text-center">
        <p className="text-neutral-400">Məhsul tapılmadı</p>
        <Link to="/catalog" className="text-gold mt-4 inline-block">← {t('nav.catalog')}</Link>
      </div>
    )
  }

  const variants = product.variants || []
  const variant = variants[selected] || { price: 0, stock: 0, label: '' }
  const liked = has(product.id)
  const lineTotal = Number(variant.price) * qty
  const lowStock = variant.stock > 0 && variant.stock <= 10
  const outOfStock = variant.stock <= 0

  const add = () => {
    if (outOfStock) return
    addItem(product, variant, qty)
    toast.success(`${product.name} (${variant.label}) səbətə əlavə olundu`)
  }
  const buyNow = () => {
    if (outOfStock) return
    addItem(product, variant, qty)
    navigate('/cart')
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-400 hover:text-gold transition-colors mb-6 text-sm">
          <FiArrowLeft /> Geri
        </button>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="sticky top-24 rounded-3xl overflow-hidden bg-black aspect-[3/4] gold-border">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" data-testid="product-image" />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {(product.moods || []).map((m) => (
                  <MoodBadge key={m} mood={m} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-2">{product.brand}</div>
            <h1 className="font-serif text-4xl sm:text-5xl text-white leading-tight" data-testid="product-name">{product.name}</h1>

            <div className="flex flex-wrap gap-6 mt-4 text-sm">
              <span className="text-neutral-400">{t('product.family')}: <span className="text-white">{product.family}</span></span>
              <span className="text-neutral-400">{t('product.season')}: <span className="text-white">{product.season}</span></span>
            </div>

            <p className="mt-5 text-neutral-300 leading-relaxed">{product.description}</p>

            {/* FOMO */}
            <div className="mt-5 flex flex-wrap gap-3">
              {lowStock && (
                <span className="flex items-center gap-2 text-xs bg-red-500/10 text-red-300 border border-red-400/30 rounded-full px-3 py-1.5" data-testid="fomo-stock">
                  <FiZap /> {t('product.stockLeft', { count: variant.stock })}
                </span>
              )}
              {viewToday > 0 && (
                <span className="flex items-center gap-2 text-xs bg-gold/10 text-gold border border-gold/30 rounded-full px-3 py-1.5" data-testid="fomo-views">
                  <FiEye /> {t('product.viewed24h', { count: viewToday })}
                </span>
              )}
            </div>

            {/* Pyramid */}
            <div className="mt-8">
              <h3 className="text-sm tracking-[0.2em] uppercase text-gold/70 mb-3">{t('product.pyramid')}</h3>
              <PerfumePyramid notes={product.notes} />
            </div>

            {/* Volume builder */}
            <div className="mt-8">
              <h3 className="text-sm tracking-[0.2em] uppercase text-gold/70 mb-3">{t('product.volume')}</h3>
              <div className="flex flex-wrap gap-2.5">
                {variants.map((v, i) => (
                  <button
                    key={v.label}
                    onClick={() => { setSelected(i); setQty(1) }}
                    data-testid={`variant-${i}`}
                    className={`px-4 py-3 rounded-xl border text-sm transition-all ${
                      selected === i ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-neutral-300 hover:border-gold/40'
                    } ${v.stock <= 0 ? 'opacity-40' : ''}`}
                  >
                    <div className="font-medium">{v.label}</div>
                    <div className="text-xs mt-0.5">{formatAZN(v.price)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + total */}
            <div className="mt-8 glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 glass-light rounded-full px-2 py-1">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center text-gold" data-testid="qty-minus"><FiMinus /></button>
                  <span className="w-8 text-center text-white" data-testid="qty-value">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="w-8 h-8 flex items-center justify-center text-gold" data-testid="qty-plus"><FiPlus /></button>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">{t('product.total')}</div>
                  <div className="text-2xl font-serif gold-text" data-testid="line-total">{formatAZN(lineTotal)}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={add} disabled={outOfStock} data-testid="add-to-cart" className="btn-gold flex-1 rounded-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-40">
                  <FiShoppingBag /> {outOfStock ? t('product.outOfStock') : t('product.addToCart')}
                </button>
                <button onClick={() => toggle(product.id)} data-testid="detail-wishlist" className={`w-14 rounded-full border flex items-center justify-center transition-colors ${liked ? 'border-rose-400 text-rose-400' : 'border-gold/40 text-gold'}`}>
                  <FiHeart className={liked ? 'fill-current' : ''} />
                </button>
              </div>
              <button onClick={buyNow} disabled={outOfStock} className="btn-outline-gold w-full rounded-full py-3 mt-3 disabled:opacity-40" data-testid="buy-now">
                İndi Al
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
