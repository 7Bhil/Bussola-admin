import React, { useState } from 'react'
import api from './api'
import imageCompression from 'browser-image-compression'

const CATEGORIES = ['Santé', 'Éducation', 'Droit', 'Social', 'Environnement']
const STATUSES = ['En attente', 'En cours', 'Terminé']

export default function ActionForm({ onSaved, initial, onCancel }) {
  const [projects, setProjects] = React.useState([])
  const [formData, setFormData] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    location: initial?.location || '',
    category: initial?.category || 'Social',
    project: initial?.project || '',
    status: initial?.status || 'En cours',
    startDate: initial?.startDate ? new Date(initial.startDate).toISOString().split('T')[0] : '',
    endDate: initial?.endDate ? new Date(initial.endDate).toISOString().split('T')[0] : '',
    beneficiaries: initial?.beneficiaries || '',
    images: initial?.images || []
  })
  const [uploading, setUploading] = useState(false)

  React.useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data)).catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    setUploading(true)
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1280,
      useWebWorker: true
    }

    try {
      const compressedImages = await Promise.all(
        files.map(async (file) => {
          const compressedFile = await imageCompression(file, options)
          return await imageCompression.getDataUrlFromFile(compressedFile)
        })
      )
      setFormData(prev => ({ 
        ...prev, 
        images: [...(prev.images || []), ...compressedImages] 
      }))
    } catch (error) {
      console.error("Compression error:", error)
      alert("Erreur lors de la compression des images")
    } finally {
      setUploading(false)
      // Reset input value to allow selecting same file again if needed
      e.target.value = ''
    }
  }

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const save = async () => {
    if (!formData.title || !formData.description) return alert("Le titre et la description sont requis")
    try {
      if (initial?._id) {
        await api.patch(`/actions/${initial._id}`, formData)
      } else {
        await api.post('/actions', formData)
      }
      onSaved()
    } catch (e) {
      const msg = e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement"
      alert(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-950">
              {initial?._id ? 'Modifier l’action' : 'Nouvelle action'}
            </h3>
            <p className="text-sm text-slate-500">Remplissez les détails de l'intervention terrain.</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Titre de l'action</label>
              <input name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Distribution de kits scolaires" className="input-field" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Détaillez le déroulement, les objectifs et l'impact..." className="input-field h-32 py-2" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Projet Parent (Pilier) *</label>
              <select name="project" value={formData.project} onChange={handleChange} className="input-field" required>
                <option value="">-- Sélectionner un pilier --</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Catégorie thématique</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Statut</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Localisation</label>
              <input name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Bukavu, Sud-Kivu" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Bénéficiaires</label>
              <input name="beneficiaries" value={formData.beneficiaries} onChange={handleChange} placeholder="Ex: 150 orphelins" className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Début</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Fin</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div className="md:col-span-2 border-t border-slate-100 pt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between items-center">
                <span>Album Photos ({formData.images.length})</span>
                {uploading && <span className="text-primary text-xs animate-pulse">Chargement en cours...</span>}
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-primary hover:bg-blue-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="mt-1 text-[10px] font-bold text-slate-500 uppercase">Ajouter</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                </label>
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 group">
                    <img src={img} alt="preview" className="h-full w-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition">×</button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">Conseil : Sélectionnez plusieurs photos à la fois pour un upload massif.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button onClick={onCancel} className="btn-secondary">Annuler</button>
          <button onClick={save} disabled={uploading} className="btn-primary">
            {initial?._id ? 'Mettre à jour l’action' : 'Créer l’action'}
          </button>
        </div>
      </div>
    </div>
  )
}
