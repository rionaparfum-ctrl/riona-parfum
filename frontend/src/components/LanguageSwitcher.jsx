import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGlobe, FiChevronDown } from 'react-icons/fi'

const LANGS = [
  { code: 'az', label: 'AZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const current = LANGS.find((l) => l.code === (i18n.language || 'az').slice(0, 2)) || LANGS[0]

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        data-testid="language-switcher"
        className="flex items-center gap-1.5 text-sm text-neutral-300 hover:text-gold transition-colors"
      >
        <FiGlobe className="text-base" />
        <span className="font-medium">{current.label}</span>
        <FiChevronDown className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="glass absolute right-0 mt-3 w-24 rounded-xl overflow-hidden z-50"
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                data-testid={`lang-option-${l.code}`}
                onClick={() => {
                  i18n.changeLanguage(l.code)
                  setOpen(false)
                }}
                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gold/10 ${
                  current.code === l.code ? 'text-gold' : 'text-neutral-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
