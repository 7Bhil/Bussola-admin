import React, { useState } from 'react'
import { X, Upload, Newspaper, User, Tag, Check, Eye } from 'lucide-react'
import api from './api'
import imageCompression from 'browser-image-compression'

const CATEGORIES = ['Action', 'Événement', 'Partenariat', 'Information']

export default function NewsForm({ onSaved, onCancel, initial }) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: initial?.title || '',
    summary: initial?.summary || '',
    content: initial?.content || '',
    category: initial?.category || 'Information',
    author: initial?.author || 'Équipe Busola',
    published: initial?.published !== undefined ? initial.published : true,
    image: initial?.image || ''
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
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1400, useWebWorker: true }
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
    if (!formData.title.trim()) return alert("Le titre est obligatoire.")
    if (!formData.summary.trim()) return alert("Le résumé court est obligatoire.")

    setSaving(true)
    try {
      if (initial?._id) {
        await api.patch(`/news/${initial._id}`, formData)
      } else {
        await api.post('/news', formData)
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
              <Newspaper size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initial?._id ? 'Modifier l’article' : 'Nouvelle actualité / Communiqué'}
              </h3>
              <p className="text-xs text-slate-500">Rédigez un contenu pour le site public de l'ONG Busola.</p>
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Titre de l'actualité *
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Lancement de la campagne de sensibilisation aux VBG"
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Résumé court (aperçu dans la liste) *
              </label>
              <input
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Ex: Retour en images sur l'atelier de formation tenu à Bukavu..."
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Contenu détaillé de l'article
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Rédigez ici l'intégralité de l'actualité..."
                className="input-field w-full h-36 text-sm rounded-xl border-slate-200 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Catégorie
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <User size={13} className="text-slate-400" />
                <span>Auteur</span>
              </label>
              <input
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Ex: Équipe Busola"
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2"
              />
            </div>

            {/* Checkbox Publication */}
            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-[#2764ae] focus:ring-[#2764ae]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Publier immédiatement sur le site public</span>
                  <span className="text-[11px] text-slate-500">Si décoché, l'article sera enregistré en mode Brouillon.</span>
                </div>
              </label>
            </div>

            {/* Image d'illustration */}
            <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Image d'illustration
              </label>

              {formData.image ? (
                <div className="relative group w-full h-44 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                  <img src={formData.image} alt="Prévisualisation" className="w-full h-full object-cover opacity-90" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1.5 shadow-md transition"
                    title="Supprimer l'image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 w-full cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition">
                  <Upload size={22} className="text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600">Ajouter une image d'en-tête</span>
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
            <span>{saving ? 'Enregistrement...' : (initial?._id ? 'Sauvegarder' : 'Publier') }</span>
          </button>
        </div>

      </div>
    </div>
  )
}
