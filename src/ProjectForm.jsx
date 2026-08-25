import React, { useState } from 'react'
import { ArrowLeft, Upload, FolderKanban, Palette, Image as ImageIcon, Check } from 'lucide-react'
import api from './api'
import imageCompression from 'browser-image-compression'

export default function ProjectForm({ onSaved, initial, onCancel }) {
  const [saving, setSaving] = useState(false)
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
    setSaving(true)
    try {
      if (initial?._id) await api.patch(`/projects/${initial._id}`, formData)
      else await api.post('/projects', formData)
      onSaved()
    } catch (e) {
      alert(e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement.")
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Retour à la liste</span>
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2764ae]">
              <FolderKanban size={14} />
              <span>{initial?._id ? "Édition de projet" : "Création de projet"}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {initial?._id ? "Modifier le projet" : "Nouveau projet d'intervention"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Annuler
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || uploading}
            className="btn-primary inline-flex items-center gap-2 bg-[#2764ae] hover:bg-[#1f5291] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm"
          >
            <Check size={16} />
            <span>{saving ? 'Enregistrement...' : initial?._id ? 'Enregistrer les modifications' : 'Créer le projet'}</span>
          </button>
        </div>
      </div>

      {/* Form Content Grid */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        
        {/* Left Column — Project Identity & Description */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
            Informations Générales
          </h3>

          <div>
            <label className="field-label flex items-center justify-between text-slate-800 font-bold mb-2">
              <span>Titre du projet / Pilier</span>
              <span className="text-rose-500 text-xs">* Requis</span>
            </label>
            <input
              value={formData.title}
              onChange={e => set('title', e.target.value)}
              className="input-field text-lg font-extrabold text-slate-900 py-3 bg-slate-50/50"
              placeholder="Ex: Santé Sexuelle et Reproductive (DSSR)"
            />
          </div>

          <div>
            <label className="field-label flex items-center justify-between text-slate-800 font-bold mb-2">
              <span>Description détaillée & Objectifs</span>
              <span className="text-rose-500 text-xs">* Requis</span>
            </label>
            <textarea
              value={formData.description}
              onChange={e => set('description', e.target.value)}
              rows={8}
              className="textarea-field bg-slate-50/50"
              placeholder="Décrivez les objectifs généraux, le public bénéficiaire et l'impact recherché..."
            />
          </div>
        </div>

        {/* Right Column — Settings & Cover Image */}
        <div className="space-y-6">
          
          {/* Appearance Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              Apparence & Ordre
            </h3>

            <div>
              <label className="field-label flex items-center gap-1.5 text-slate-800 font-bold mb-2">
                <Palette size={14} className="text-[#2764ae]" />
                <span>Couleur distinctive</span>
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => set('color', e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 p-0 bg-transparent"
                />
                <span className="font-mono text-sm font-bold text-slate-800">{formData.color.toUpperCase()}</span>
              </div>
            </div>

            <div>
              <label className="field-label text-slate-800 font-bold mb-2">Ordre d'affichage</label>
              <input
                type="number"
                value={formData.order}
                onChange={e => set('order', Number(e.target.value))}
                className="input-field bg-slate-50/50 font-bold"
                min={0}
              />
              <p className="text-[11px] text-slate-400 mt-1">Détermine la priorité d'affichage sur la galerie public</p>
            </div>
          </div>

          {/* Cover Image Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <label className="field-label flex items-center gap-1.5 text-slate-800 font-bold">
              <ImageIcon size={14} className="text-[#2764ae]" />
              <span>Image de couverture</span>
            </label>

            {formData.coverImage ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 group">
                <img src={formData.coverImage} alt="Aperçu" className="h-48 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('coverImage', '')}
                  className="absolute top-3 right-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
                >
                  Supprimer l'image
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:border-[#2764ae] hover:bg-blue-50/40 transition">
                <Upload size={28} className="text-slate-400" />
                <p className="text-xs font-bold text-slate-700">Importer l'image de couverture</p>
                <p className="text-[11px] text-slate-400">JPG, PNG, WEBP — Compression automatique</p>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <p className="text-xs font-semibold text-slate-500">
          {uploading ? '⏳ Traitement de l\'image...' : ' ONG Busola — Piliers Projets'}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
          <button type="button" onClick={save} disabled={saving || uploading} className="btn-primary">
            {saving ? 'Enregistrement...' : initial?._id ? 'Enregistrer les modifications' : 'Créer le projet'}
          </button>
        </div>
      </div>
    </div>
  )
}
