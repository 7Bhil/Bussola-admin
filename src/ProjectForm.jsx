import React, { useState } from 'react'
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

  const set = (name, value) => setFormData(p => ({ ...p, [name]: value }))

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.9, maxWidthOrHeight: 1600 })
      const b64 = await imageCompression.getDataUrlFromFile(compressed)
      set('coverImage', b64)
    } catch { alert("Erreur lors du traitement de l'image.") }
    finally { setUploading(false) }
  }

  const save = async () => {
    if (!formData.title.trim()) return alert("Le titre est obligatoire.")
    if (!formData.description.trim()) return alert("La description est obligatoire.")
    try {
      if (initial?._id) await api.patch(`/projects/${initial._id}`, formData)
      else await api.post('/projects', formData)
      onSaved()
    } catch (e) {
      alert(e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement.")
    }
  }

  return (
    <div className="modal-overlay flex items-start justify-center p-4 pt-10">
      <div className="modal-panel animate-scale-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2764ae]">Contenus & Projets</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {initial?._id ? 'Modifier le projet' : "Nouveau projet d'intervention"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto max-h-[calc(100vh-280px)] px-6 py-6 space-y-6">

          {/* Identité */}
          <div className="form-section">
            <p className="form-section-title">Identité du projet</p>

            <div>
              <label className="field-label">Nom / Titre du projet <span className="text-red-400">*</span></label>
              <input
                value={formData.title}
                onChange={e => set('title', e.target.value)}
                className="input-field"
                placeholder="Ex: Santé Sexuelle et Reproductive (DSSR)"
              />
            </div>

            <div>
              <label className="field-label">Description <span className="text-red-400">*</span></label>
              <textarea
                value={formData.description}
                onChange={e => set('description', e.target.value)}
                rows={4}
                className="textarea-field"
                placeholder="Décrivez les objectifs, le public cible et l'impact recherché..."
              />
            </div>
          </div>

          {/* Apparence */}
          <div className="form-section">
            <p className="form-section-title">Apparence & Ordre</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Couleur du projet</label>
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-slate-300 transition">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => set('color', e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border-0 p-0 bg-transparent"
                  />
                  <span className="font-mono text-sm text-slate-700 font-semibold">{formData.color.toUpperCase()}</span>
                </div>
              </div>

              <div>
                <label className="field-label">Ordre d'affichage</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={e => set('order', Number(e.target.value))}
                  className="input-field"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Image de couverture */}
          <div className="form-section">
            <p className="form-section-title">Image de couverture</p>

            {formData.coverImage ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                <img src={formData.coverImage} alt="Cover" className="h-48 w-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => set('coverImage', '')}
                  className="absolute top-3 right-3 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                >
                  Retirer
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-center hover:border-[#2764ae]/50 hover:bg-blue-50/30 transition">
                <div className="mb-3 rounded-xl bg-slate-200 p-3">
                  <svg className="h-7 w-7 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700">Glissez ou choisissez une image</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP — max 5 Mo recommandé</p>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-400">
            {uploading ? '⏳ Compression en cours...' : 'Les champs * sont obligatoires'}
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary text-sm px-5">Annuler</button>
            <button onClick={save} disabled={uploading} className="btn-primary text-sm px-5">
              {initial?._id ? 'Enregistrer les modifications' : 'Créer le projet'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
