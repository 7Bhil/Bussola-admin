import React, { useState } from 'react'
import api from './api'

export default function TestimonialForm({ onSaved, onCancel, initial }) {
  const [saving, setSaving] = useState(false)
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }))
    reader.readAsDataURL(file)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (initial?._id) {
        await api.patch(`/testimonials/${initial._id}`, formData)
      } else {
        await api.post('/testimonials', formData)
      }
      onSaved()
    } catch (e) {
      const msg = e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement"
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-panel">
      <div className="mb-5 flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{initial?._id ? 'Modifier le témoignage' : 'Nouveau témoignage'}</h3>
          <p className="text-sm text-slate-500">Ajoutez un témoignage inspirant de bénéficiaire ou partenaire.</p>
        </div>
        <div className="flex gap-2">
          {formData.showOnHome && <span className="badge bg-emerald-100 text-emerald-800">Accueil</span>}
          {formData.showOnActions && <span className="badge bg-blue-100 text-blue-800">Actions</span>}
          {formData.archived && <span className="badge bg-red-100 text-red-800">Archivé</span>}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Nom complet / Identité</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Mariam, 24 ans ou Makou Murielle" className="input-field" required />
            </div>

            <div>
              <label className="field-label">Rôle / Programme</label>
              <input name="role" value={formData.role} onChange={handleChange} placeholder="Ex: Bénéficiaire du programme YES" className="input-field" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Localisation (Optionnel)</label>
              <input name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Karimama, Nord-Bénin" className="input-field" />
            </div>

            <div>
              <label className="field-label">Note / Évaluation (1-5)</label>
              <select name="rating" value={formData.rating} onChange={handleChange} className="select-field">
                <option value={5}>⭐⭐⭐⭐⭐ (5 étoiles)</option>
                <option value={4}>⭐⭐⭐⭐ (4 étoiles)</option>
                <option value={3}>⭐⭐⭐ (3 étoiles)</option>
                <option value={2}>⭐⭐ (2 étoiles)</option>
                <option value={1}>⭐ (1 étoile)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Message / Témoignage</label>
            <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Racontez leur histoire ou écrivez le témoignage ici..." className="textarea-field min-h-40" required />
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl bg-slate-50 p-4">
          <div>
            <label className="field-label">Photo du témoin (Optionnel)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" />
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {formData.image ? (
                <img src={formData.image} alt="Aperçu du témoin" className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center text-sm text-slate-400">Aucune photo</div>
              )}
            </div>
            {formData.image && <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} className="mt-2 text-sm font-semibold text-red-600 hover:text-red-800">Retirer la photo</button>}
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-3">
            <label className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold text-slate-700">
              <input type="checkbox" name="showOnHome" checked={formData.showOnHome} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500" />
              Afficher sur l'accueil
            </label>

            <label className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold text-slate-700">
              <input type="checkbox" name="showOnActions" checked={formData.showOnActions} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500" />
              Afficher sur "Nos actions"
            </label>

            <label className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold text-slate-700">
              <input type="checkbox" name="archived" checked={formData.archived} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-red-700 focus:ring-red-500" />
              Archiver (masquer)
            </label>
          </div>
        </aside>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
        <button type="button" onClick={save} disabled={saving} className="btn-primary">{saving ? 'Enregistrement...' : initial?._id ? 'Mettre à jour' : 'Créer'}</button>
      </div>
    </div>
  )
}
