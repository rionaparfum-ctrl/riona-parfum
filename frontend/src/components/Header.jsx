import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiGift,
  FiCompass,
} from 'react-icons/fi'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'
import ScentQuiz from './ScentQuiz'
import GiftFinder from './GiftFinder'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const { count } = useWishlist()
  const { user, isAdmin } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [quizOpen, setQuizOpen] = useState(false)
  const [giftOpen, setGiftOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    const openQuiz = () => setQuizOpen(true)
    const openGift = () => setGiftOpen(true)
    window.addEventListener('open-quiz', openQuiz)
    window.addEventListener('open-gift', openGift)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('open-quiz', openQuiz)
      window.removeEventListener('open-gift', openGift)
    }
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQ.trim())}`)
      setSearchOpen(false)
      setSearchQ('')
    }
  }

  const iconBtn =
    'relative p-2 text-neutral-300 hover:text-gold transition-colors duration-300'

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass py-2.5' : 'bg-transparent py-4'
        }`}
        data-testid="main-header"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden lg:flex items-center gap-7 text-sm text-neutral-300">
              <Link to="/" className="hover:text-gold transition-colors" data-testid="nav-home">
                {t('nav.home')}
              </Link>
              <Link to="/catalog" className="hover:text-gold transition-colors" data-testid="nav-catalog">
                {t('nav.catalog')}
              </Link>
              <button
                onClick={() => setQuizOpen(true)}
                className="flex items-center gap-1.5 hover:text-gold transition-colors"
                data-testid="nav-quiz"
              >
                <FiCompass /> {t('nav.quiz')}
              </button>
              <button
                onClick={() => setGiftOpen(true)}
                className="flex items-center gap-1.5 hover:text-gold transition-colors"
                data-testid="nav-gift"
              >
                <FiGift /> {t('nav.gift')}
              </button>
              {isAdmin && (
                <Link to="/admin" className="text-gold/80 hover:text-gold transition-colors" data-testid="nav-admin">
                  {t('nav.admin')}
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button className={iconBtn} onClick={() => setSearchOpen((s) => !s)} data-testid="search-toggle">
              <FiSearch className="text-xl" />
            </button>
            <LanguageSwitcher />
            <Link to="/wishlist" className={iconBtn} data-testid="nav-wishlist">
              <FiHeart className="text-xl" />
              {count > 0 && <Badge n={count} testId="wishlist-badge" />}
            </Link>
            <Link to="/cart" className={iconBtn} data-testid="nav-cart">
              <FiShoppingBag className="text-xl" />
              {itemCount > 0 && <Badge n={itemCount} testId="cart-badge" />}
            </Link>
            <Link to={user ? '/account' : '/auth'} className={`${iconBtn} hidden sm:block`} data-testid="nav-account">
              <FiUser className="text-xl" />
            </Link>
            <button className={`${iconBtn} lg:hidden`} onClick={() => setMobileOpen(true)} data-testid="mobile-menu-toggle">
              <FiMenu className="text-xl" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={submitSearch}
              className="max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden"
            >
              <div className="mt-3 flex items-center gap-3 glass rounded-full px-5 py-3">
                <FiSearch className="text-gold" />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder={t('search')}
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-neutral-500"
                  data-testid="search-input"
                />
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
              className="absolute right-0 top-0 h-full w-72 glass p-6 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button onClick={() => setMobileOpen(false)} data-testid="mobile-menu-close">
                  <FiX className="text-2xl text-neutral-300" />
                </button>
              </div>
              <nav className="flex flex-col gap-4 text-lg text-neutral-200">
                <Link to="/" onClick={() => setMobileOpen(false)}>{t('nav.home')}</Link>
                <Link to="/catalog" onClick={() => setMobileOpen(false)}>{t('nav.catalog')}</Link>
                <button className="text-left" onClick={() => { setQuizOpen(true); setMobileOpen(false) }}>{t('nav.quiz')}</button>
                <button className="text-left" onClick={() => { setGiftOpen(true); setMobileOpen(false) }}>{t('nav.gift')}</button>
                <Link to={user ? '/account' : '/auth'} onClick={() => setMobileOpen(false)}>{t('nav.account')}</Link>
                {isAdmin && <Link to="/admin" className="text-gold" onClick={() => setMobileOpen(false)}>{t('nav.admin')}</Link>}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScentQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />
      <GiftFinder open={giftOpen} onClose={() => setGiftOpen(false)} />
    </>
  )
}

function Badge({ n, testId }) {
  return (
    <span data-testid={testId} className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[17px] h-[17px] px-1 rounded-full bg-gold text-ink text-[10px] font-bold">
      {n}
    </span>
  )
}
