import { useTranslation } from 'react-i18next'

const STYLES = {
  night: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
  romantic: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  office: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  daily: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  special: 'bg-gold/15 text-gold border-gold/30',
  fresh: 'bg-teal-500/15 text-teal-300 border-teal-400/30',
}

export default function MoodBadge({ mood }) {
  const { t } = useTranslation()
  return (
    <span
      className={`inline-block text-[10px] tracking-wide px-2 py-0.5 rounded-full border ${STYLES[mood] || 'bg-white/5 text-neutral-300 border-white/10'}`}
    >
      {t(`moods.${mood}`)}
    </span>
  )
}
