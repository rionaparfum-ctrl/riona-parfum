import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FiChevronRight } from 'react-icons/fi'
import Modal from './Modal'
import { useProducts } from '@/hooks/useProducts'
import { formatAZN } from '@/lib/utils'

const BUDGETS = [
  { label: '10 – 25 ₼', min: 0, max: 25 },
  { label: '25 – 50 ₼', min: 25, max: 50 },
  { label: '50 – 90 ₼', min: 50, max: 90 },
  { label: '90 ₼ +', min: 90, max: Infinity },
]

export default function GiftFinder({ open, onClose }) {
  const { t } = useTranslation()
  const { products } = useProducts()
  const [gender, setGender] = useState(null)
  const [budget, setBudget] = useState(null)

  const results = useMemo(() => {
    if (!gender || !budget) return []
    return products.filter((p) => {
      const genderOk = p.gender === gender || p.gender === 'unisex'
      const minPrice = Math.min(...(p.variants || [{ price: 0 }]).map((v) => Number(v.price)))
      const priceOk = minPrice >= budget.min && minPrice <= budget.max
      return genderOk && priceOk
    })
  }, [products, gender, budget])

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-xl" testId="gift-modal">
      <div className="text-center mb-6">
        <h2 className="font-serif text-3xl gold-text">{t('gift.title')}</h2>
        <p className="text-sm text-neutral-400 mt-2">{t('gift.subtitle')}</p>
      </div>

      <div className="mb-5">
        <div className="text-[11px] tracking-[0.2em] uppercase text-gold/70 mb-2">{t('gift.gender')}</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: 'women', label: t('quiz.forWho.women') },
            { v: 'men', label: t('quiz.forWho.men') },
            { v: 'unisex', label: t('quiz.forWho.unisex') },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setGender(o.v)}
              data-testid={`gift-gender-${o.v}`}
              className={`rounded-xl px-3 py-3 text-sm border transition-all ${
                gender === o.v ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-neutral-300 hover:border-gold/40'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-[11px] tracking-[0.2em] uppercase text-gold/70 mb-2">{t('gift.budget')}</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b.label}
              onClick={() => setBudget(b)}
              data-testid={`gift-budget-${b.min}`}
              className={`rounded-xl px-2 py-3 text-xs border transition-all ${
                budget?.label === b.label ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-neutral-300 hover:border-gold/40'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {gender && budget && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-gold text-sm mb-3 tracking-wide">{t('gift.results')}</div>
          {results.length === 0 ? (
            <p className="text-center text-neutral-400 py-4">{t('quiz.noResult')}</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {results.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  onClick={onClose}
                  data-testid={`gift-result-${p.id}`}
                  className="flex items-center gap-4 glass-light rounded-xl p-3 border border-white/10 hover:border-gold/50 transition-all"
                >
                  <img src={p.imageUrl} alt={p.name} className="w-14 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <div className="font-serif text-white">{p.name}</div>
                    <div className="text-xs text-neutral-400">{p.family}</div>
                  </div>
                  <div className="text-gold text-sm">
                    {formatAZN(Math.min(...(p.variants || [{ price: 0 }]).map((v) => Number(v.price))))}
                  </div>
                  <FiChevronRight className="text-gold" />
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </Modal>
  )
}
