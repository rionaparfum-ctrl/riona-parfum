import { Link } from 'react-router-dom'

export default function Logo({ className = '', compact = false }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group ${className}`} data-testid="logo-link">
      <span className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark text-ink font-serif text-2xl font-bold leading-none shadow-gold transition-transform duration-500 group-hover:rotate-6">
        R
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-xl tracking-[0.2em] gold-text font-semibold">RIONA</span>
          <span className="text-[9px] tracking-[0.45em] text-neutral-400 mt-0.5">PARFUM</span>
        </span>
      )}
    </Link>
  )
}
