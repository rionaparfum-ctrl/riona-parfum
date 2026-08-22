import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { FiPlus, FiEdit2, FiTrash2, FiUploadCloud, FiX, FiDatabase } from 'react-icons/fi'
import { db } from '@/firebase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import Modal from '@/components/Modal'
import { useProducts } from '@/hooks/useProducts'
import { useToast } from '@/components/Toast'
import { formatAZN } from '@/lib/utils'
import { seedProducts, FAMILIES, CHARACTERS, SEASONS, MOODS, GENDERS } from '@/data/seedProducts'

const EMPTY = {
  name: '', brand: '', gender: 'unisex', family: FAMILIES[0], season: SEASONS[0],
  description: '', imageUrl: '', moods: [], characters: [], featured: false,
  notes: { top: '', middle: '', base: '' },
  variants: [{ label: '', price: '', stock: '' }],
}

export default function AdminProducts() {
  const { t } = useTranslation()
  const { products } = useProducts()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setOpen(true)
  }

  const openEdit = (p) => {
    setEditing(p.id)
    setForm({
      name: p.name || '', brand: p.brand || '', gender: p.gender || 'unisex',
      family: p.family || FAMILIES[0], season: p.season || SEASONS[0],
      description: p.description || '', imageUrl: p.imageUrl || '',
      moods: p.moods || [], characters: p.characters || [], featured: !!p.featured,
      notes: {
        top: (p.notes?.top || []).join(', '),
        middle: (p.notes?.middle || []).join(', '),
        base: (p.notes?.base || []).join(', '),
      },
      variants: (p.variants || []).map((v) => ({ label: v.label, price: String(v.price), stock: String(v.stock) })),
    })
    setOpen(true)
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      setForm((f) => ({ ...f, imageUrl: url }))
      toast.success('Şəkil Cloudinary-yə yükləndi')
    } catch (err) {
      toast.error('Şəkil yüklənmədi: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const toggleMood = (m) => {
    setForm((f) => ({ ...f, moods: f.moods.includes(m) ? f.moods.filter((x) => x !== m) : [...f.moods, m] }))
  }
  const toggleCharacter = (c) => {
    setForm((f) => ({ ...f, characters: f.characters.includes(c) ? f.characters.filter((x) => x !== c) : [...f.characters, c] }))
  }

  const setVariant = (i, key, value) => {
    setForm((f) => {
      const variants = [...f.variants]
      variants[i] = { ...variants[i], [key]: value }
      return { ...f, variants }
    })
  }
  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, { label: '', price: '', stock: '' }] }))
  const removeVariant = (i) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))

  const save = async (e) => {
    e.preventDefault()
    if (!form.imageUrl) {
      toast.error('Zəhmət olmasa şəkil yükləyin')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name, brand: form.brand, gender: form.gender, family: form.family,
        season: form.season, description: form.description, imageUrl: form.imageUrl,
        moods: form.moods, characters: form.characters, featured: form.featured,
        notes: {
          top: form.notes.top.split(',').map((s) => s.trim()).filter(Boolean),
          middle: form.notes.middle.split(',').map((s) => s.trim()).filter(Boolean),
          base: form.notes.base.split(',').map((s) => s.trim()).filter(Boolean),
        },
        variants: form.variants
          .filter((v) => v.label && v.price)
          .map((v) => ({ label: v.label, price: Number(v.price), stock: Number(v.stock) || 0 })),
      }
      if (editing) {
        await updateDoc(doc(db, 'products', editing), payload)
        toast.success('Məhsul yeniləndi')
      } else {
        await addDoc(collection(db, 'products'), { ...payload, views: 0, createdAt: serverTimestamp() })
        toast.success('Məhsul əlavə edildi')
      }
      setOpen(false)
    } catch (err) {
      toast.error('Xəta: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Bu məhsulu silmək istəyirsiniz?')) return
    await deleteDoc(doc(db, 'products', id))
    toast.success('Məhsul silindi')
  }

  const seed = async () => {
    setSeeding(true)
    try {
      const batch = writeBatch(db)
      seedProducts.forEach((p) => {
        const refDoc = doc(collection(db, 'products'))
        batch.set(refDoc, { ...p, views: 0, createdAt: serverTimestamp() })
      })
      await batch.commit()
      toast.success('Nümunə məhsullar yükləndi')
    } catch (err) {
      toast.error('Xəta: ' + err.message)
    } finally {
      setSeeding(false)
    }
  }

  const input = 'w-full bg-charcoal border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-gold'

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-white">{t('admin.products')}</h1>
        <div className="flex gap-3">
          {products.length === 0 && (
            <button onClick={seed} disabled={seeding} className="btn-outline-gold rounded-full px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50" data-testid="seed-btn">
              <FiDatabase /> {seeding ? '...' : t('admin.seed')}
            </button>
          )}
          <button onClick={openNew} className="btn-gold rounded-full px-5 py-2.5 text-sm flex items-center gap-2" data-testid="add-product-btn">
            <FiPlus /> {t('admin.addProduct')}
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="glass-light rounded-2xl p-12 text-center text-neutral-400">Məhsul yoxdur. Nümunə yükləyin və ya yeni əlavə edin.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="glass rounded-2xl overflow-hidden" data-testid={`admin-product-${p.id}`}>
              <div className="aspect-video bg-black overflow-hidden">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="text-[10px] uppercase tracking-widest text-gold/70">{p.brand}</div>
                <h3 className="font-serif text-lg text-white">{p.name}</h3>
                <div className="text-xs text-neutral-500 mt-1">{p.family} · {p.variants?.length} variant</div>
                <div className="text-gold text-sm mt-1">min {formatAZN(Math.min(...(p.variants || [{ price: 0 }]).map((v) => Number(v.price))))}</div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEdit(p)} className="flex-1 btn-outline-gold rounded-lg py-2 text-sm flex items-center justify-center gap-1.5" data-testid={`edit-product-${p.id}`}><FiEdit2 /> {t('common.edit')}</button>
                  <button onClick={() => remove(p.id)} className="rounded-lg py-2 px-3 text-sm border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors" data-testid={`delete-product-${p.id}`}><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} maxWidth="max-w-2xl" testId="product-modal">
        <h2 className="font-serif text-2xl text-white mb-6">{editing ? t('admin.editProduct') : t('admin.addProduct')}</h2>
        <form onSubmit={save} className="space-y-5">
          {/* Image upload */}
          <div>
            <label className="text-xs tracking-widest uppercase text-gold/70 mb-2 block">{t('admin.image')}</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-black overflow-hidden border border-white/10 flex items-center justify-center">
                {form.imageUrl ? <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" /> : <FiUploadCloud className="text-2xl text-neutral-600" />}
              </div>
              <label className="btn-outline-gold rounded-xl px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2">
                <FiUploadCloud /> {uploading ? 'Yüklənir...' : t('admin.uploadImage')}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" data-testid="product-image-upload" />
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ad" className={input} data-testid="product-name-input" />
            <input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brend" className={input} data-testid="product-brand-input" />
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={input}>
              {GENDERS.map((g) => <option key={g} value={g}>{t(`quiz.forWho.${g}`)}</option>)}
            </select>
            <select value={form.family} onChange={(e) => setForm({ ...form, family: e.target.value })} className={input}>
              {FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className={input}>
              {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-neutral-300 px-1">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-[#D4AF37]" />
              Seçilmiş (Featured)
            </label>
          </div>

          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Təsvir" rows={2} className={`${input} resize-none`} />

          {/* Moods */}
          <div>
            <label className="text-xs tracking-widest uppercase text-gold/70 mb-2 block">Əhval teqləri (Mood)</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button type="button" key={m} onClick={() => toggleMood(m)} className={`rounded-full px-3 py-1.5 text-xs border transition-all ${form.moods.includes(m) ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-neutral-300'}`}>
                  {t(`moods.${m}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Characters */}
          <div>
            <label className="text-xs tracking-widest uppercase text-gold/70 mb-2 block">Xarakter (Tünd / Şirin / Təravətli)</label>
            <div className="flex flex-wrap gap-2">
              {CHARACTERS.map((c) => (
                <button type="button" key={c} onClick={() => toggleCharacter(c)} className={`rounded-full px-3 py-1.5 text-xs border transition-all ${form.characters.includes(c) ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-neutral-300'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="grid sm:grid-cols-3 gap-3">
            <input value={form.notes.top} onChange={(e) => setForm({ ...form, notes: { ...form.notes, top: e.target.value } })} placeholder="Üst notlar (vergüllə)" className={input} />
            <input value={form.notes.middle} onChange={(e) => setForm({ ...form, notes: { ...form.notes, middle: e.target.value } })} placeholder="Orta notlar" className={input} />
            <input value={form.notes.base} onChange={(e) => setForm({ ...form, notes: { ...form.notes, base: e.target.value } })} placeholder="Baza notlar" className={input} />
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs tracking-widest uppercase text-gold/70">{t('admin.variants')}</label>
              <button type="button" onClick={addVariant} className="text-gold text-sm flex items-center gap-1" data-testid="add-variant"><FiPlus /> {t('admin.addVariant')}</button>
            </div>
            <div className="space-y-2">
              {form.variants.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={v.label} onChange={(e) => setVariant(i, 'label', e.target.value)} placeholder="10 qram / 50 ml" className={input} data-testid={`variant-label-${i}`} />
                  <input value={v.price} onChange={(e) => setVariant(i, 'price', e.target.value)} placeholder="Qiymət ₼" type="number" step="0.01" className={`${input} w-28`} data-testid={`variant-price-${i}`} />
                  <input value={v.stock} onChange={(e) => setVariant(i, 'stock', e.target.value)} placeholder="Stok" type="number" className={`${input} w-24`} data-testid={`variant-stock-${i}`} />
                  <button type="button" onClick={() => removeVariant(i)} className="text-red-400 p-2"><FiX /></button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving || uploading} className="btn-gold w-full rounded-full py-3.5 disabled:opacity-50" data-testid="save-product">
            {saving ? '...' : t('common.save')}
          </button>
        </form>
      </Modal>
    </div>
  )
}
