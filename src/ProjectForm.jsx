import React, { useState } from 'react'
import { X, Upload, FolderKanban, Palette, Image as ImageIcon, Check } from 'lucide-react'
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
    if (!formData.title.trim()) return alert("Le nom du projet est obligatoire.")
    if (!formData.description.trim()) return alert("La description du projet est obligatoire.")
    try {
      if (initial?._id) await api.patch(`/projects/${initial._id}`, formData)
      else await api.post('/projects', formData)
      onSaved()
    } catch (e) {
      alert(e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement.")
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container-md">

        {/* ── Fixed Header ── */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#2764ae]">
              <FolderKanban size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initial?._id ? "Modifier le projet" : "Nouveau projet d'intervention"}
              </h2>
              <p className="text-xs font-medium text-slate-500">Piliers stratégiques de l'ONG Busola</p>
            </div>
          </div>

          <button onClick={onCancel} className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition">
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="modal-body">
          {/* Identité */}
          <div className="space-y-4">
            <p className="form-section-title">
              <FolderKanban size={15} />
              <span>Identité du projet</span>
            </p>

            <div>
              <label className="field-label flex items-center justify-between">
                <span>Titre du projet</span>
                <span className="text-rose-500 font-bold">* Requis</span>
              </label>
              <input
                value={formData.title}
                onChange={e => set('title', e.target.value)}
                className="input-field font-bold text-base"
                placeholder="Ex: Santé Sexuelle et Reproductive (DSSR)"
              />
            </div>

            <div>
              <label className="field-label flex items-center justify-between">
                <span>Description & Objectifs</span>
                <span className="text-rose-500 font-bold">* Requis</span>
              </label>
              <textarea
                value={formData.description}
                onChange={e => set('description', e.target.value)}
                rows={4}
                className="textarea-field"
                placeholder="Décrivez les objectifs généraux, le public bénéficiaire et l'impact recherché..."
              />
            </div>
          </div>

          {/* Apparence */}
          <div className="space-y-4 pt-2">
            <p className="form-section-title">
              <Palette size={15} />
              <span>Apparence & Tri</span>
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Couleur distinctive</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3.5 py-2 shadow-sm hover:border-slate-400 transition">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => set('color', e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border-0 p-0 bg-transparent"
                  />
                  <span className="font-mono text-sm font-bold text-slate-800">{formData.color.toUpperCase()}</span>
                </div>
              </div>

              <div>
                <label className="field-label">Ordre d'affichage</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={e => set('order', Number(e.target.value))}
                  className="input-field font-bold"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="space-y-3 pt-2">
            <p className="form-section-title">
              <ImageIcon size={15} />
              <span>Image de couverture</span>
            </p>

            {formData.coverImage ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-900">
                <img src={formData.coverImage} alt="Aperçu" className="h-44 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('coverImage', '')}
                  className="absolute top-3 right-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-[#2764ae] hover:bg-blue-50/30 transition">
                <Upload size={26} className="text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700">Choisir ou glisser une image</p>
                <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WEBP — max 5 Mo</p>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        {/* ── Fixed Footer ── */}
        <div className="modal-footer">
          <p className="text-xs font-semibold text-slate-500">
            {uploading ? '⏳ Traitement de l\'image...' : 'Projet Pilier'}
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary">Annuler</button>
            <button onClick={save} disabled={uploading} className="btn-primary">
              <Check size={16} />
              <span>{initial?._id ? 'Enregistrer les modifications' : 'Créer le projet'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
