import React, { useState } from 'react'
import { X, Upload, Quote, User, MapPin, Star, Check, Home, Activity, Archive } from 'lucide-react'
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
    if (!formData.role.trim()) return alert("Le rôle / statut est obligatoire.")
    if (!formData.message.trim()) return alert("Le message de témoignage est obligatoire.")
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
    <div className="modal-overlay">
      <div className="modal-container-md">

        {/* ── Fixed Header ── */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#2764ae]">
              <Quote size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initial?._id ? 'Modifier le témoignage' : "Nouveau témoignage d'impact"}
              </h2>
              <p className="text-xs font-medium text-slate-500">Récits de bénéficiaires & partenaires</p>
            </div>
          </div>

          <button onClick={onCancel} className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition">
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="modal-body">
          {/* Identity Section */}
          <div className="space-y-4">
            <p className="form-section-title">
              <User size={15} />
              <span>Identité du témoin</span>
            </p>

            <div className="flex items-start gap-4">
              {/* Photo Avatar */}
              <div className="shrink-0">
                {formData.image ? (
                  <div className="relative group">
                    <img src={formData.image} alt="Avatar" className="h-20 w-20 rounded-2xl object-cover border border-slate-300 shadow-sm" />
                    <button
                      type="button"
                      onClick={() => set('image', '')}
                      className="absolute -top-2 -right-2 rounded-full bg-rose-600 p-1 text-white shadow hover:bg-rose-700 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-[#2764ae] hover:bg-blue-50/40 transition">
                    <Upload size={18} className="text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Photo</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="field-label flex items-center justify-between">
                    <span>Nom complet / Prénom</span>
                    <span className="text-rose-500 font-bold">* Requis</span>
                  </label>
                  <input
                    value={formData.name}
                    onChange={e => set('name', e.target.value)}
                    className="input-field font-bold"
                    placeholder="Ex: Mariam K."
                  />
                </div>
                <div>
                  <label className="field-label flex items-center justify-between">
                    <span>Rôle / Titre / Statut</span>
                    <span className="text-rose-500 font-bold">* Requis</span>
                  </label>
                  <input
                    value={formData.role}
                    onChange={e => set('role', e.target.value)}
                    className="input-field"
                    placeholder="Ex: Bénéficiaire du projet DSSR"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="field-label flex items-center gap-1.5 text-slate-800">
                <MapPin size={14} className="text-[#2764ae]" />
                <span>Localisation (Ville / Commune)</span>
              </label>
              <input
                value={formData.location}
                onChange={e => set('location', e.target.value)}
                className="input-field"
                placeholder="Ex: Parakou, Nord-Bénin"
              />
            </div>
          </div>

          {/* Message & Rating Section */}
          <div className="space-y-4 pt-2">
            <p className="form-section-title">
              <Quote size={15} />
              <span>Message & Évaluation</span>
            </p>

            <div>
              <label className="field-label flex items-center justify-between">
                <span>Récit / Témoignage</span>
                <span className="text-rose-500 font-bold">* Requis</span>
              </label>
              <textarea
                value={formData.message}
                onChange={e => set('message', e.target.value)}
                rows={4}
                className="textarea-field"
                placeholder="Racontez le vécu, l'impact ou le témoignage du bénéficiaire..."
              />
            </div>

            <div>
              <label className="field-label flex items-center gap-1.5 text-slate-800">
                <Star size={14} className="text-amber-500" />
                <span>Évaluation (Note sur 5)</span>
              </label>
              <div className="flex items-center gap-2 mt-1">
                {RATINGS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set('rating', r)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      size={24}
                      className={formData.rating >= r ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                    />
                  </button>
                )).reverse()}
                <span className="ml-2 text-sm font-bold text-slate-800">{formData.rating} / 5 étoiles</span>
              </div>
            </div>
          </div>

          {/* Visibility Controls Section */}
          <div className="space-y-3 pt-2">
            <p className="form-section-title">
              <Home size={15} />
              <span>Visibilité sur le site public</span>
            </p>

            <div className="space-y-2">
              {[
                { key: 'showOnHome', icon: Home, label: "Afficher sur la page d'accueil", desc: "Positionné dans le carrousel de témoignages de l'accueil", activeClass: 'border-[#2764ae] bg-blue-50/80 text-blue-950 ring-2 ring-blue-400/20' },
                { key: 'showOnActions', icon: Activity, label: "Afficher sur la page Actions", desc: "Affiché sur la page présentant les programmes", activeClass: 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-400/20' },
                { key: 'archived', icon: Archive, label: 'Archiver (Masquer partout)', desc: 'Le témoignage sera masqué sur tout le site', activeClass: 'border-rose-500 bg-rose-50/80 text-rose-950 ring-2 ring-rose-400/20' },
              ].map(({ key, icon: Icon, label, desc, activeClass }) => {
                const checked = formData[key]
                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 transition-all ${
                      checked ? activeClass : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => set(key, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                      checked ? 'border-current bg-current text-white' : 'border-slate-400 bg-white'
                    }`}>
                      {checked && <Check size={12} className="stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="shrink-0" />
                        <span className="text-xs font-bold">{label}</span>
                      </div>
                      <p className="text-[11px] font-normal text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Fixed Footer ── */}
        <div className="modal-footer">
          <p className="text-xs font-semibold text-slate-500">
            {uploading ? '⏳ Traitement de la photo...' : 'Témoignage ONG Busola'}
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary">Annuler</button>
            <button onClick={save} disabled={saving || uploading} className="btn-primary">
              <Check size={16} />
              <span>{saving ? 'Enregistrement...' : initial?._id ? 'Enregistrer les modifications' : 'Créer le témoignage'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
