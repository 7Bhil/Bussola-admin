import React, { useState } from 'react'
import api from './api'
import imageCompression from 'browser-image-compression'

const RATINGS = [5, 4, 3, 2, 1]

export default function TestimonialForm({ onSaved, onCancel, initial }) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: initial?.name || '',
    role: initial?.role || '',
    location: initial?.location || '',
    rating: initial?.rating !== undefined ? initial.rating : 5,
    message: initial?.message || '',
    image: initial?.image || '',
    showOnHome: initial?.showOnHome !== undefined ? initial.showOnHome : true,
    showOnActions: initial?.showOnActions !== undefined ? initial.showOnActions : false,
    archived: initial?.archived !== undefined ? initial.archived : false
  })

  const set = (name, value) => setFormData(p => ({ ...p, [name]: value }))

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const c = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 800 })
      const b64 = await imageCompression.getDataUrlFromFile(c)
      set('image', b64)
    } catch { alert("Erreur lors du traitement de la photo.") }
    finally { setUploading(false) }
  }

  const save = async () => {
    if (!formData.name.trim()) return alert("Le nom est obligatoire.")
    if (!formData.role.trim()) return alert("Le rôle est obligatoire.")
    if (!formData.message.trim()) return alert("Le message est obligatoire.")
    setSaving(true)
    try {
      if (initial?._id) await api.patch(`/testimonials/${initial._id}`, formData)
      else await api.post('/testimonials', formData)
      onSaved()
    } catch (e) {
      alert(e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement.")
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay flex items-start justify-center p-4 pt-8">
      <div className="modal-panel animate-scale-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2764ae]">Impact & Récits</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {initial?._id ? 'Modifier le témoignage' : "Nouveau témoignage d'impact"}
            </h2>
          </div>
          <button onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto max-h-[calc(100vh-260px)] px-6 py-6 space-y-6">

          {/* Section : Identité */}
          <div className="form-section">
            <p className="form-section-title">Identité du témoin</p>

            <div className="flex items-start gap-5">
              {/* Photo de profil */}
              <div className="shrink-0">
                {formData.image ? (
                  <div className="relative">
                    <img src={formData.image} alt="" className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                    <button onClick={() => set('image', '')}
                      className="absolute -top-2 -right-2 rounded-full bg-rose-600 p-0.5 text-white shadow hover:bg-rose-700 transition">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-[#2764ae]/50 hover:bg-blue-50/30 transition">
                    <svg className="h-7 w-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Photo</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="field-label">Nom complet <span className="text-red-400">*</span></label>
                  <input value={formData.name} onChange={e => set('name', e.target.value)}
                    className="input-field" placeholder="Ex: Mariam Alassane" />
                </div>
                <div>
                  <label className="field-label">Rôle / Programme <span className="text-red-400">*</span></label>
                  <input value={formData.role} onChange={e => set('role', e.target.value)}
                    className="input-field" placeholder="Ex: Bénéficiaire du projet DSSR" />
                </div>
              </div>
            </div>

            <div>
              <label className="field-label">Localisation</label>
              <input value={formData.location} onChange={e => set('location', e.target.value)}
                className="input-field" placeholder="Ex: Karimama, Alibori" />
            </div>
          </div>

          {/* Section : Message & Note */}
          <div className="form-section">
            <p className="form-section-title">Témoignage</p>

            <div>
              <label className="field-label">Message / Récit <span className="text-red-400">*</span></label>
              <textarea value={formData.message} onChange={e => set('message', e.target.value)}
                rows={5} className="textarea-field"
                placeholder="Racontez le vécu, les changements ressentis ou l'impact de l'ONG sur leur vie..." />
            </div>

            <div>
              <label className="field-label">Évaluation</label>
              <div className="flex items-center gap-2">
                {RATINGS.map(r => (
                  <button key={r} type="button" onClick={() => set('rating', r)}
                    className="transition-transform hover:scale-110">
                    <svg className={`h-8 w-8 transition ${formData.rating >= r ? 'text-amber-400' : 'text-slate-200'}`}
                      fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                )).reverse()}
                <span className="ml-2 text-sm font-bold text-slate-700">{formData.rating} / 5</span>
              </div>
            </div>
          </div>

          {/* Section : Visibilité */}
          <div className="form-section">
            <p className="form-section-title">Visibilité sur le site public</p>
            <div className="space-y-2">
              {[
                { key: 'showOnHome', label: "Afficher sur la page d'accueil", desc: "Visible dans la section témoignages de la homepage", accent: 'emerald' },
                { key: 'showOnActions', label: 'Afficher sur la page Actions', desc: "Visible sur la page listant les actions de l'ONG", accent: 'blue' },
                { key: 'archived', label: 'Archiver (masquer partout)', desc: 'Ce témoignage ne sera visible nulle part', accent: 'rose' },
              ].map(({ key, label, desc, accent }) => {
                const checked = formData[key]
                const border = checked ? `border-${accent}-200` : 'border-slate-200'
                const bg = checked ? `bg-${accent}-50` : 'bg-white hover:bg-slate-50'
                return (
                  <label key={key} className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${border} ${bg}`}>
                    <input type="checkbox" checked={checked} onChange={e => set(key, e.target.checked)} className="sr-only" />
                    <div className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                      checked ? `border-${accent}-500 bg-${accent}-500` : 'border-slate-300 bg-white'
                    }`}>
                      {checked && (
                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-400">Les champs * sont obligatoires</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary text-sm px-5">Annuler</button>
            <button onClick={save} disabled={saving || uploading} className="btn-primary text-sm px-5">
              {saving ? 'Enregistrement...' : initial?._id ? 'Enregistrer les modifications' : 'Créer le témoignage'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
