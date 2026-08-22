import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiEye, FiShoppingBag } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import MoodBadge from './MoodBadge'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { useToast } from './Toast'
import { formatAZN } from '@/lib/utils'

export default function ProductCard({ product, onQuickView, index = 0 }) {
  const { t } = useTranslation()
  const { has, toggle } = useWishlist()
  const { addItem } = useCart()
  const toast = useToast()
  const variants = product.variants || []
  const minPrice = variants.length ? Math.min(...variants.map((v) => Number(v.price))) : 0
  const liked = has(product.id)

  const quickAdd = (e) => {
    e.preventDefault()
    if (!variants.length) return
    addItem(product, variants[0], 1)
    toast.success(`${product.name} səbətə əlavə olundu`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative glass-light rounded-2xl overflow-hidden card-hover border border-white/5">
        <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-black">
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[75%]">
            {(product.moods || []).slice(0, 2).map((m) => (
              <MoodBadge key={m} mood={m} />
            ))}
          </div>
        </Link>

        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => toggle(product.id)}
            data-testid={`wishlist-btn-${product.id}`}
            className={`flex items-center justify-center w-9 h-9 rounded-full glass ${liked ? 'text-rose-400' : 'text-white'} hover:text-rose-400 transition-colors`}
          >
            <FiHeart className={liked ? 'fill-current' : ''} />
          </button>
          <button
            onClick={() => onQuickView?.(product)}
            data-testid={`quickview-btn-${product.id}`}
            className="flex items-center justify-center w-9 h-9 rounded-full glass text-white hover:text-gold transition-colors"
          >
            <FiEye />
          </button>
        </div>

        <div className="p-4">
          <div className="text-[11px] tracking-widest uppercase text-gold/70 mb-1">{product.brand}</div>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-serif text-lg text-white leading-tight hover:text-gold transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="mt-1 text-xs text-neutral-500">{product.family}</div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-gold font-semibold">
              <span className="text-[11px] text-neutral-500 mr-1">min</span>
              {formatAZN(minPrice)}
            </div>
            <button
              onClick={quickAdd}
              data-testid={`add-cart-btn-${product.id}`}
              className="flex items-center justify-center w-9 h-9 rounded-full btn-gold"
            >
              <FiShoppingBag className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
