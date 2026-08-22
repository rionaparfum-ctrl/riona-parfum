import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiUser } from 'react-icons/fi'
import Logo from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/Toast'
import { HERO_IMAGE } from '@/data/seedProducts'

const ERRORS = {
  'auth/invalid-credential': 'E-poçt və ya parol yanlışdır',
  'auth/user-not-found': 'İstifadəçi tapılmadı',
  'auth/wrong-password': 'Parol yanlışdır',
  'auth/email-already-in-use': 'Bu e-poçt artıq qeydiyyatdadır',
  'auth/weak-password': 'Parol ən azı 6 simvol olmalıdır',
  'auth/invalid-email': 'E-poçt formatı yanlışdır',
}

export default function Auth() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register, isAdmin } = useAuth()
  const toast = useToast()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password)
      }
      toast.success('Xoş gəldiniz!')
      const from = location.state?.from
      navigate(from || '/account')
    } catch (err) {
      toast.error(ERRORS[err.code] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={HERO_IMAGE} alt="Riona" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="font-serif text-4xl gold-text">Lüks qoxuların dünyası</h2>
          <p className="text-neutral-300 mt-3">RIONA PARFUM hesabınızla cashback qazanın və sifarişlərinizi izləyin.</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8"><Logo /></div>
          <h1 className="font-serif text-3xl text-white">{mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}</h1>
          <p className="text-neutral-400 mt-2 text-sm">{mode === 'login' ? t('auth.haveAccount') : t('auth.noAccount')}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === 'register' && (
              <Field icon={<FiUser />}>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('auth.name')} className="input" data-testid="auth-name" />
              </Field>
            )}
            <Field icon={<FiMail />}>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t('auth.email')} className="input" data-testid="auth-email" />
            </Field>
            <Field icon={<FiLock />}>
              <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t('auth.password')} className="input" data-testid="auth-password" />
            </Field>

            <button type="submit" disabled={loading} className="btn-gold w-full rounded-full py-3.5 disabled:opacity-50" data-testid="auth-submit">
              {loading ? '...' : mode === 'login' ? t('auth.login') : t('auth.register')}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="mt-6 text-sm text-neutral-400 hover:text-gold transition-colors w-full text-center"
            data-testid="auth-toggle"
          >
            {mode === 'login' ? t('auth.noAccount') + ' ' + t('auth.register') : t('auth.haveAccount') + ' ' + t('auth.login')}
          </button>

          <Link to="/" className="mt-4 block text-center text-xs text-neutral-500 hover:text-gold">← RIONA PARFUM</Link>
        </motion.div>
      </div>

      <style>{`.input{width:100%;background:transparent;outline:none;color:#fff;font-size:14px}.input::placeholder{color:#6b7280}`}</style>
    </div>
  )
}

function Field({ icon, children }) {
  return (
    <div className="glass rounded-xl px-4 py-3.5 flex items-center gap-3">
      <span className="text-gold">{icon}</span>
      {children}
    </div>
  )
}
