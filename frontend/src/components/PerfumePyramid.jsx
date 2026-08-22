import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export default function PerfumePyramid({ notes }) {
  const { t } = useTranslation()
  if (!notes) return null
  const levels = [
    { key: 'top', label: t('product.top'), items: notes.top || [], w: 'w-1/2' },
    { key: 'middle', label: t('product.middle'), items: notes.middle || [], w: 'w-3/4' },
    { key: 'base', label: t('product.base'), items: notes.base || [], w: 'w-full' },
  ]
  return (
    <div className="space-y-3" data-testid="perfume-pyramid">
      {levels.map((lvl, i) => (
        <motion.div
          key={lvl.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12 }}
          className={`mx-auto ${lvl.w}`}
        >
          <div className="glass rounded-xl px-4 py-3 border-gold/20">
            <div className="text-[10px] tracking-[0.25em] uppercase text-gold/70 mb-1.5">{lvl.label}</div>
            <div className="flex flex-wrap gap-1.5">
              {lvl.items.map((n) => (
                <span key={n} className="text-xs text-neutral-200 bg-white/5 rounded-full px-2.5 py-1">
                  {n}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
