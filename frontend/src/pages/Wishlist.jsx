import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiHeart } from 'react-icons/fi'
import ProductCard from '@/components/ProductCard'
import QuickViewModal from '@/components/QuickViewModal'
import { useProducts } from '@/hooks/useProducts'
import { useWishlist } from '@/context/WishlistContext'

export default function Wishlist() {
  const { t } = useTranslation()
  const { products } = useProducts()
  const { ids } = useWishlist()
  const [quickView, setQuickView] = useState(null)

  const items = products.filter((p) => ids.includes(p.id))

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="font-serif text-4xl text-white mb-8 flex items-center gap-3">
          <FiHeart className="text-gold" /> {t('wishlist.title')}
        </h1>
        {items.length === 0 ? (
          <div className="text-center py-20 glass-light rounded-2xl">
            <p className="text-neutral-400">{t('wishlist.empty')}</p>
            <Link to="/catalog" className="btn-gold rounded-full px-8 py-3 inline-block mt-6">{t('nav.catalog')}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onQuickView={setQuickView} />
            ))}
          </div>
        )}
      </div>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>
  )
}
