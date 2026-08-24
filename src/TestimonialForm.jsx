import React, { useState } from 'react'
import { X, Upload, Quote, User, MapPin, Star, Check, Home, Activity, Archive } from 'lucide-react'
import api from './api'
import imageCompression from 'browser-image-compression'

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1280, useWebWorker: true }
      const compressedFile = await imageCompression(file, options)
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile)
      setFormData(prev => ({ ...prev, image: base64 }))
    } catch (error) {
      alert("Erreur lors de la compression de l'image.")
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!formData.name.trim()) return alert("Le nom du témoin est obligatoire.")
    if (!formData.role.trim()) return alert("Le rôle / statut est obligatoire.")
    if (!formData.message.trim()) return alert("Le message est obligatoire.")

    setSaving(true)
    try {
      if (initial?._id) {
        await api.patch(`/testimonials/${initial._id}`, formData)
      } else {
        await api.post('/testimonials', formData)
      }
      onSaved()
    } catch (e) {
      const msg = e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement."
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[#2764ae]">
              <Quote size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initial?._id ? 'Modifier le témoignage' : 'Nouveau témoignage d’impact'}
              </h3>
              <p className="text-xs text-slate-500">Ajoutez le retour d'un bénéficiaire ou partenaire de l'ONG Busola.</p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <User size={13} className="text-slate-400" />
                <span>Nom complet / Prénom *</span>
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Mariam K."
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2.5"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Rôle / Titre / Statut *
              </label>
              <input
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Ex: Bénéficiaire du projet DSSR"
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2.5"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin size={13} className="text-slate-400" />
                <span>Localisation (Ville / Commune)</span>
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Parakou, Nord-Bénin"
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <Star size={13} className="text-amber-400" />
                <span>Évaluation (Étoiles)</span>
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2.5"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                <option value={3}>⭐⭐⭐ (3/5)</option>
                <option value={2}>⭐⭐ (2/5)</option>
                <option value={1}>⭐ (1/5)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Message / Témoignage *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Racontez le témoignage de l'intervenant ou du bénéficiaire..."
                className="input-field w-full h-32 text-sm rounded-xl border-slate-200 py-2"
                required
              />
            </div>

            {/* Options d'affichage */}
            <div className="sm:col-span-2 space-y-2 border-t border-slate-100 pt-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Options d'affichage sur le site public
              </label>

              <div className="grid gap-2 sm:grid-cols-3">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70 transition">
                  <input
                    type="checkbox"
                    name="showOnHome"
                    checked={formData.showOnHome}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-[#2764ae] focus:ring-[#2764ae]"
                  />
                  <span className="text-xs font-bold text-slate-800">Page d'accueil</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70 transition">
                  <input
                    type="checkbox"
                    name="showOnActions"
                    checked={formData.showOnActions}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-[#2764ae] focus:ring-[#2764ae]"
                  />
                  <span className="text-xs font-bold text-slate-800">Page Actions</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer hover:bg-rose-100/50 transition">
                  <input
                    type="checkbox"
                    name="archived"
                    checked={formData.archived}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-800">Archiver (Masquer)</span>
                </label>
              </div>
            </div>

            {/* Photo du témoin */}
            <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Photo du témoin (Optionnel)
              </label>

              {formData.image ? (
                <div className="relative group w-32 h-32 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                  <img src={formData.image} alt="Prévisualisation" className="w-full h-full object-cover opacity-90" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow-md transition"
                    title="Supprimer la photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-28 w-full cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition">
                  <Upload size={22} className="text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600">Ajouter une photo de profil</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Annuler
          </button>
          
          <button
            onClick={save}
            disabled={saving || uploading}
            className="btn-primary inline-flex items-center gap-2 bg-[#2764ae] hover:bg-[#1f5291] text-white px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Check size={16} />
            <span>{saving ? 'Enregistrement...' : (initial?._id ? 'Sauvegarder' : 'Créer')}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
