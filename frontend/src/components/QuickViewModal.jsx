import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import PerfumePyramid from './PerfumePyramid'
import { useCart } from '@/context/CartContext'
import { useToast } from './Toast'
import { formatAZN } from '@/lib/utils'

export default function QuickViewModal({ product, onClose }) {
  const { t } = useTranslation()
  const { addItem } = useCart()
  const toast = useToast()
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    setSelected(0)
  }, [product])

  if (!product) return null
  const variants = product.variants || []
  const variant = variants[selected]

  const add = () => {
    addItem(product, variant, 1)
    toast.success(`${product.name} (${variant.label}) səbətə əlavə olundu`)
    onClose()
  }

  return (
    <Modal open={!!product} onClose={onClose} maxWidth="max-w-3xl" testId="quickview-modal">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden bg-black aspect-[3/4]">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <div className="text-[11px] tracking-widest uppercase text-gold/70">{product.brand}</div>
          <h2 className="font-serif text-3xl text-white mt-1">{product.name}</h2>
          <p className="text-sm text-neutral-400 mt-3 leading-relaxed">{product.description}</p>

          <div className="mt-5">
            <div className="text-[11px] tracking-[0.2em] uppercase text-gold/70 mb-2">{t('product.pyramid')}</div>
            <PerfumePyramid notes={product.notes} />
          </div>

          <div className="mt-5">
            <div className="text-[11px] tracking-[0.2em] uppercase text-gold/70 mb-2">{t('product.volume')}</div>
            <div className="flex flex-wrap gap-2">
              {variants.map((v, i) => (
                <button
                  key={v.label}
                  onClick={() => setSelected(i)}
                  data-testid={`qv-variant-${i}`}
                  className={`px-3.5 py-2 rounded-lg text-sm border transition-all ${
                    selected === i
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-white/10 text-neutral-300 hover:border-gold/40'
                  }`}
                >
                  {v.label} · {formatAZN(v.price)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 flex items-center gap-3">
            <button onClick={add} data-testid="qv-add-cart" className="btn-gold flex-1 rounded-full py-3">
              {t('product.addToCart')} — {formatAZN(variant?.price)}
            </button>
            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="btn-outline-gold rounded-full px-5 py-3 text-sm"
            >
              →
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  )
}
