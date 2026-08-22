import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FiArrowRight, FiCompass } from 'react-icons/fi'
import ProductCard from '@/components/ProductCard'
import QuickViewModal from '@/components/QuickViewModal'
import { useProducts } from '@/hooks/useProducts'
import { HERO_IMAGE, MOODS } from '@/data/seedProducts'

export default function Home() {
  const { t } = useTranslation()
  const { products, loading } = useProducts()
  const [quickView, setQuickView] = useState(null)

  const featured = products.filter((p) => p.featured)
  const display = [...featured, ...products.filter((p) => !p.featured)].slice(0, 8)

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="Riona Parfum" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 w-full pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-12 bg-gold" />
              <span className="text-xs tracking-[0.35em] text-gold uppercase">{t('hero.tag')}</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-white">
              {t('hero.title').split(' ').map((w, i) => (
                <span key={i} className={i % 3 === 1 ? 'gold-text italic' : ''}>
                  {w}{' '}
                </span>
              ))}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-neutral-300 max-w-xl leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/catalog" className="btn-gold rounded-full px-8 py-3.5 flex items-center gap-2" data-testid="hero-cta-catalog">
                {t('hero.cta')} <FiArrowRight />
              </Link>
              <button
                onClick={() => window.dispatchEvent(new Event('open-quiz'))}
                className="btn-outline-gold rounded-full px-8 py-3.5 flex items-center gap-2"
                data-testid="hero-cta-quiz"
              >
                <FiCompass /> {t('hero.cta2')}
              </button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-6 py-16 mt-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-2">RIONA</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-white">{t('sections.featured')}</h2>
            <p className="text-neutral-400 mt-2">{t('sections.featuredSub')}</p>
          </div>
          <Link to="/catalog" className="hidden sm:flex items-center gap-2 text-gold hover:gap-3 transition-all text-sm">
            {t('common.all')} <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin-slow" />
          </div>
        ) : display.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {display.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onQuickView={setQuickView} />
            ))}
          </div>
        )}
      </section>

      {/* MOODS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-white">{t('sections.moods')}</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {MOODS.map((m) => (
            <Link
              key={m}
              to={`/catalog?mood=${m}`}
              className="glass-light rounded-full px-6 py-3 text-sm text-neutral-200 border border-white/10 hover:border-gold hover:text-gold transition-all"
              data-testid={`mood-chip-${m}`}
            >
              {t(`moods.${m}`)}
            </Link>
          ))}
        </div>
      </section>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>
  )
}

function EmptyState() {
  const { t } = useTranslation()
  return (
    <div className="text-center py-20 glass-light rounded-2xl">
      <p className="text-neutral-400">
        Məhsul yoxdur. Admin paneldən <span className="text-gold">"{t('admin.seed')}"</span> düyməsi ilə nümunə əlavə edin.
      </p>
    </div>
  )
}
