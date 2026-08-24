import React, { useState } from 'react'
import { X, Upload, Palette, Layers, FolderKanban, Check } from 'lucide-react'
import api from './api'
import imageCompression from 'browser-image-compression'

export default function ProjectForm({ onSaved, initial, onCancel }) {
  const [formData, setFormData] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    coverImage: initial?.coverImage || '',
    color: initial?.color || '#2764ae',
    order: initial?.order ?? 0,
    pillar: initial?.pillar || ''
  })
  const [uploading, setUploading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const options = { maxSizeMB: 0.9, maxWidthOrHeight: 1600, useWebWorker: true }
      const compressedFile = await imageCompression(file, options)
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile)
      setFormData(prev => ({ ...prev, coverImage: base64 }))
    } catch (error) {
      alert("Erreur lors du traitement de l'image.")
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!formData.title.trim()) return alert("Le titre du projet est obligatoire.")
    if (!formData.description.trim()) return alert("La description est obligatoire.")

    try {
      if (initial?._id) {
        await api.patch(`/projects/${initial._id}`, formData)
      } else {
        await api.post('/projects', formData)
      }
      onSaved()
    } catch (e) {
      const msg = e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement."
      alert(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[#2764ae]">
              <FolderKanban size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initial?._id ? 'Modifier le projet' : 'Nouveau projet d’intervention'}
              </h3>
              <p className="text-xs text-slate-500">Configurez ce pôle d'action de l'ONG Busola.</p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Titre du projet *
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Santé Sexuelle et Reproductive (DSSR)"
              className="input-field w-full rounded-xl border-slate-200 focus:border-[#2764ae] text-sm py-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description complète *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez les objectifs, le public cible et l'impact recherché..."
              className="input-field w-full h-28 py-2.5 rounded-xl border-slate-200 focus:border-[#2764ae] text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Palette size={14} className="text-slate-500" />
                <span>Couleur du projet</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="h-10 w-12 cursor-pointer rounded-xl border border-slate-200 p-1"
                />
                <input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="input-field font-mono uppercase text-xs font-bold py-2 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers size={14} className="text-slate-500" />
                <span>Ordre d'affichage</span>
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="input-field w-full py-2 text-sm rounded-xl"
              />
            </div>
          </div>

          {/* Image Couverture */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Image de couverture
            </label>

            {formData.coverImage ? (
              <div className="relative group w-full h-44 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                <img
                  src={formData.coverImage}
                  alt="Prévisualisation"
                  className="w-full h-full object-cover opacity-90"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                  className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1.5 shadow-md transition"
                  title="Supprimer la photo"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 w-full cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition">
                <Upload size={24} className="text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-600">Choisir une image de couverture</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Format conseillé : WEBP, JPG ou PNG (max 5Mo)</span>
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

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Annuler
          </button>
          
          <button
            onClick={save}
            disabled={uploading}
            className="btn-primary inline-flex items-center gap-2 bg-[#2764ae] hover:bg-[#1f5291] text-white px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Check size={16} />
            <span>{uploading ? 'Traitement...' : (initial?._id ? 'Sauvegarder' : 'Créer le projet')}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
