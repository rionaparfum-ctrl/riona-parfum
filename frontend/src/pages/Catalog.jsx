import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import QuickViewModal from '@/components/QuickViewModal'
import { useProducts } from '@/hooks/useProducts'
import { FAMILIES, CHARACTERS, SEASONS, MOODS } from '@/data/seedProducts'

export default function Catalog() {
  const { t } = useTranslation()
  const { products, loading } = useProducts()
  const [params, setParams] = useSearchParams()
  const [quickView, setQuickView] = useState(null)

  const q = params.get('q') || ''
  const mood = params.get('mood') || ''
  const family = params.get('family') || ''
  const gender = params.get('gender') || ''
  const season = params.get('season') || ''
  const character = params.get('character') || ''

  const [search, setSearch] = useState(q)
  useEffect(() => setSearch(q), [q])

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !`${p.name} ${p.brand} ${p.family}`.toLowerCase().includes(search.toLowerCase())) return false
      if (mood && !(p.moods || []).includes(mood)) return false
      if (family && p.family !== family) return false
      if (season && p.season !== season) return false
      if (character && !(p.characters || []).includes(character)) return false
      if (gender && p.gender !== gender && p.gender !== 'unisex') return false
      return true
    })
  }, [products, search, mood, family, gender, season, character])

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-2">RIONA PARFUM</div>
          <h1 className="font-serif text-4xl sm:text-5xl text-white">{t('nav.catalog')}</h1>
        </motion.div>

        {/* Search */}
        <div className="glass rounded-full px-5 py-3 flex items-center gap-3 mb-6 max-w-md">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setParam('q', e.target.value)
            }}
            placeholder={t('search')}
            className="flex-1 bg-transparent outline-none text-white placeholder:text-neutral-500 text-sm"
            data-testid="catalog-search"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterGroup label={t('gift.gender')} value={gender} onChange={(v) => setParam('gender', v)} options={[
            { v: 'women', label: t('quiz.forWho.women') },
            { v: 'men', label: t('quiz.forWho.men') },
            { v: 'unisex', label: t('quiz.forWho.unisex') },
          ]} />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Chip active={!family} onClick={() => setParam('family', '')}>{t('common.all')}</Chip>
          {FAMILIES.map((f) => (
            <Chip key={f} active={family === f} onClick={() => setParam('family', f)} testId={`family-chip-${f}`}>{f}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Chip active={!character} onClick={() => setParam('character', '')}>Xarakter: {t('common.all')}</Chip>
          {CHARACTERS.map((c) => (
            <Chip key={c} active={character === c} onClick={() => setParam('character', c)} testId={`character-chip-${c}`}>{c}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Chip active={!season} onClick={() => setParam('season', '')}>Mövsüm: {t('common.all')}</Chip>
          {SEASONS.map((s) => (
            <Chip key={s} active={season === s} onClick={() => setParam('season', s)} testId={`season-chip-${s}`}>{s}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-10">
          <Chip active={!mood} onClick={() => setParam('mood', '')}>{t('sections.moods')}: {t('common.all')}</Chip>
          {MOODS.map((m) => (
            <Chip key={m} active={mood === m} onClick={() => setParam('mood', m)} testId={`mood-chip-${m}`}>{t(`moods.${m}`)}</Chip>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin-slow" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 glass-light rounded-2xl">Nəticə tapılmadı</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" data-testid="catalog-grid">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onQuickView={setQuickView} />
            ))}
          </div>
        )}
      </div>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>
  )
}

function Chip({ active, onClick, children, testId }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`rounded-full px-4 py-1.5 text-xs border transition-all ${
        active ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-neutral-300 hover:border-gold/40'
      }`}
    >
      {children}
    </button>
  )
}

function FilterGroup({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-500">{label}:</span>
      <Chip active={!value} onClick={() => onChange('')}>Hamısı</Chip>
      {options.map((o) => (
        <Chip key={o.v} active={value === o.v} onClick={() => onChange(o.v)} testId={`gender-chip-${o.v}`}>{o.label}</Chip>
      ))}
    </div>
  )
}
