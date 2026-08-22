import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'riona_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })
  const [promo, setPromo] = useState(null) // { code, type, value }
  const [giftWrap, setGiftWrap] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const [tester, setTester] = useState(null) // product name string

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, variant, qty = 1) => {
    setItems((prev) => {
      const key = `${product.id}__${variant.label}`
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          imageUrl: product.imageUrl,
          variantLabel: variant.label,
          price: Number(variant.price),
          qty,
        },
      ]
    })
  }

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key))
  const updateQty = (key, qty) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)))
  const clear = () => {
    setItems([])
    setPromo(null)
    setGiftWrap(false)
    setGiftMessage('')
    setTester(null)
  }

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])
  const distinctProducts = useMemo(() => new Set(items.map((i) => i.productId)).size, [items])
  const hasBundle = distinctProducts >= 3
  const bundleDiscount = hasBundle ? subtotal * 0.15 : 0

  const promoDiscount = useMemo(() => {
    if (!promo) return 0
    const base = subtotal - bundleDiscount
    if (promo.type === 'percent') return (base * Number(promo.value)) / 100
    return Math.min(Number(promo.value), base)
  }, [promo, subtotal, bundleDiscount])

  const giftWrapFee = giftWrap ? 3 : 0
  const testerEligible = subtotal >= 50
  const total = Math.max(0, subtotal - bundleDiscount - promoDiscount + giftWrapFee)
  const itemCount = items.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clear,
        subtotal,
        hasBundle,
        bundleDiscount,
        promo,
        setPromo,
        promoDiscount,
        giftWrap,
        setGiftWrap,
        giftWrapFee,
        giftMessage,
        setGiftMessage,
        tester,
        setTester,
        testerEligible,
        total,
        itemCount,
        distinctProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
