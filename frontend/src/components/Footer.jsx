import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FaInstagram, FaWhatsapp, FaTelegramPlane, FaTiktok } from 'react-icons/fa'
import Logo from './Logo'
import { WHATSAPP_NUMBER } from '@/firebase'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-gold/15 bg-charcoal/60 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-5 max-w-sm text-sm text-neutral-400 leading-relaxed">
            {t('footer.tagline')}. RIONA PARFUM — {t('hero.subtitle')}
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { i: <FaWhatsapp />, href: `https://wa.me/${WHATSAPP_NUMBER}` },
              { i: <FaInstagram />, href: '#' },
              { i: <FaTelegramPlane />, href: '#' },
              { i: <FaTiktok />, href: '#' },
            ].map((s, idx) => (
              <a
                key={idx}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gold/30 text-gold hover:bg-gold hover:text-ink transition-all duration-300"
              >
                {s.i}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-gold text-sm tracking-widest uppercase mb-4">Menyu</h4>
          <ul className="space-y-2.5 text-sm text-neutral-400">
            <li><Link to="/" className="hover:text-gold transition-colors">{t('nav.home')}</Link></li>
            <li><Link to="/catalog" className="hover:text-gold transition-colors">{t('nav.catalog')}</Link></li>
            <li><Link to="/wishlist" className="hover:text-gold transition-colors">{t('wishlist.title')}</Link></li>
            <li><Link to="/account" className="hover:text-gold transition-colors">{t('nav.account')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-gold text-sm tracking-widest uppercase mb-4">Əlaqə</h4>
          <ul className="space-y-2.5 text-sm text-neutral-400">
            <li>WhatsApp: +{WHATSAPP_NUMBER}</li>
            <li>Naxçıvan, Azərbaycan</li>
            <li>10:00 — 22:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} RIONA PARFUM. {t('footer.rights')}.
      </div>
    </footer>
  )
}
