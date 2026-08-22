import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronRight, FiRefreshCw } from 'react-icons/fi'
import Modal from './Modal'
import { useProducts } from '@/hooks/useProducts'
import { CHARACTERS, MOODS } from '@/data/seedProducts'
import { formatAZN } from '@/lib/utils'

export default function ScentQuiz({ open, onClose }) {
  const { t } = useTranslation()
  const { products } = useProducts()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ gender: null, character: null, mood: null })

  const questions = [
    {
      key: 'gender',
      q: t('quiz.q1'),
      options: [
        { v: 'women', label: t('quiz.forWho.women') },
        { v: 'men', label: t('quiz.forWho.men') },
        { v: 'unisex', label: t('quiz.forWho.unisex') },
      ],
    },
    { key: 'character', q: t('quiz.q2'), options: CHARACTERS.map((c) => ({ v: c, label: c })) },
    { key: 'mood', q: t('quiz.q3'), options: MOODS.map((m) => ({ v: m, label: t(`moods.${m}`) })) },
  ]

  const results = useMemo(() => {
    if (step < 3) return []
    return products
      .map((p) => {
        let score = 0
        if (answers.gender && (p.gender === answers.gender || p.gender === 'unisex')) score += 2
        if (answers.character && (p.characters || []).includes(answers.character)) score += 3
        if (answers.mood && (p.moods || []).includes(answers.mood)) score += 3
        return { p, score }
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.p)
  }, [step, products, answers])

  const choose = (key, v) => {
    setAnswers((a) => ({ ...a, [key]: v }))
    setTimeout(() => setStep((s) => s + 1), 220)
  }

  const reset = () => {
    setStep(0)
    setAnswers({ gender: null, character: null, mood: null })
  }

  const close = () => {
    onClose()
    setTimeout(reset, 300)
  }

  return (
    <Modal open={open} onClose={close} maxWidth="max-w-xl" testId="quiz-modal">
      <div className="text-center mb-6">
        <div className="text-[11px] tracking-[0.3em] uppercase text-gold/70">AI</div>
        <h2 className="font-serif text-3xl gold-text mt-1">{t('quiz.title')}</h2>
        <p className="text-sm text-neutral-400 mt-2">{t('quiz.subtitle')}</p>
      </div>

      {step < 3 && (
        <div className="mb-5 flex gap-2 justify-center">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1 w-10 rounded-full transition-colors ${i <= step ? 'bg-gold' : 'bg-white/10'}`} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step < 3 ? (
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <h3 className="text-lg text-white text-center mb-5">{questions[step].q}</h3>
            <div className="grid grid-cols-2 gap-3">
              {questions[step].options.map((o) => (
                <button
                  key={o.v}
                  onClick={() => choose(questions[step].key, o.v)}
                  data-testid={`quiz-option-${o.v}`}
                  className="glass-light rounded-xl px-4 py-4 text-sm text-neutral-200 border border-white/10 hover:border-gold hover:text-gold transition-all"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-center text-gold mb-4 tracking-wide">{t('quiz.result')}</h3>
            {results.length === 0 ? (
              <p className="text-center text-neutral-400 py-6">{t('quiz.noResult')}</p>
            ) : (
              <div className="space-y-3">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    onClick={close}
                    data-testid={`quiz-result-${p.id}`}
                    className="flex items-center gap-4 glass-light rounded-xl p-3 border border-white/10 hover:border-gold/50 transition-all"
                  >
                    <img src={p.imageUrl} alt={p.name} className="w-16 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-widest text-gold/70">{p.brand}</div>
                      <div className="font-serif text-lg text-white">{p.name}</div>
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
            <button onClick={reset} className="mx-auto mt-6 flex items-center gap-2 text-sm text-neutral-400 hover:text-gold transition-colors" data-testid="quiz-restart">
              <FiRefreshCw /> {t('quiz.again')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
