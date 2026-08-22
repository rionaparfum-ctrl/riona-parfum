import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, ADMIN_EMAIL } from '@/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser)
        const ref = doc(db, 'users', fbUser.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setProfile({ id: fbUser.uid, ...snap.data() })
        } else {
          const data = {
            name: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email,
            role: fbUser.email === ADMIN_EMAIL ? 'admin' : 'user',
            points: 0,
            createdAt: serverTimestamp(),
          }
          await setDoc(ref, data)
          setProfile({ id: fbUser.uid, ...data })
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const register = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    const data = {
      name,
      email,
      role: email === ADMIN_EMAIL ? 'admin' : 'user',
      points: 0,
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', cred.user.uid), data)
    setProfile({ id: cred.user.uid, ...data })
    return cred.user
  }

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const logout = () => signOut(auth)

  const refreshProfile = async () => {
    if (!user) return
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (snap.exists()) setProfile({ id: user.uid, ...snap.data() })
  }

  const isAdmin = !!user && (user.email === ADMIN_EMAIL || profile?.role === 'admin')

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, register, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
