import React, { useState } from 'react'
import api from './api'
import imageCompression from 'browser-image-compression'

export default function ProjectForm({ onSaved, initial, onCancel }) {
  const [formData, setFormData] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    coverImage: initial?.coverImage || '',
    color: initial?.color || '#3498db',
    order: initial?.order || 0
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
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }
      const compressedFile = await imageCompression(file, options)
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile)
      setFormData(prev => ({ ...prev, coverImage: base64 }))
    } catch (error) {
      alert("Erreur lors de la compression")
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    try {
      if (initial?._id) {
        await api.patch(`/projects/${initial._id}`, formData)
      } else {
        await api.post('/projects', formData)
      }
      onSaved()
    } catch (e) {
      const msg = e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement"
      alert(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="text-xl font-bold text-slate-950">
            {initial?._id ? 'Modifier le projet' : 'Nouveau projet'}
          </h3>
          <p className="text-sm text-slate-500">Un projet est un pilier majeur de l'ONG (ex: Santé, Éducation).</p>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Titre du projet</label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Pôle Santé & Nutrition" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Décrivez les objectifs de ce projet..." className="input-field h-32 py-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Couleur (Hex)</label>
              <div className="flex gap-2">
                <input type="color" name="color" value={formData.color} onChange={handleChange} className="h-10 w-10 cursor-pointer rounded border-0 p-0" />
                <input name="color" value={formData.color} onChange={handleChange} className="input-field font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ordre d'affichage</label>
              <input type="number" name="order" value={formData.order} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Image de couverture</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="input-field py-1.5" />
            {formData.coverImage && (
              <div className="mt-2 relative group w-full h-40 overflow-hidden rounded-xl border border-slate-200">
                <img src={formData.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                <button onClick={() => setFormData(prev => ({...prev, coverImage: ''}))} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-700 transition">×</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button onClick={onCancel} className="btn-secondary">Annuler</button>
          <button onClick={save} disabled={uploading} className="btn-primary">
            {uploading ? 'Compression...' : (initial?._id ? 'Sauvegarder les modifications' : 'Créer le projet')}
          </button>
        </div>
      </div>
    </div>
  )
}
