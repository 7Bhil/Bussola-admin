import React, { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Activity, MapPin, Users, Calendar, FolderKanban, Check, X } from 'lucide-react'
import api from './api'
import imageCompression from 'browser-image-compression'

const CATEGORIES = ['Santé', 'Éducation', 'Droit', 'Social', 'Environnement']
const STATUSES = ['En cours', 'Terminé', 'En attente']
const LEGACY_TITLES = new Set(['pageda', 'yes', 'tedidjo'])
const isLegacy = (p) => LEGACY_TITLES.has(p.title.trim().toLowerCase())

export default function ActionForm({ onSaved, initial, onCancel }) {
  const [projects, setProjects] = useState([])
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    location: initial?.location || '',
    category: initial?.category || 'Social',
    project: initial?.project?._id || initial?.project || '',
    status: initial?.status || 'En cours',
    startDate: initial?.startDate ? new Date(initial.startDate).toISOString().split('T')[0] : '',
    endDate: initial?.endDate ? new Date(initial.endDate).toISOString().split('T')[0] : '',
    beneficiaries: initial?.beneficiaries || '',
    images: initial?.images || []
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api.get('/projects').then(res => {
      const list = res.data.filter(p => !isLegacy(p))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title))
      setProjects(list)
      if (!formData.project && list.length > 0) {
        setFormData(p => ({ ...p, project: list[0]._id }))
      }
    }).catch(() => {})
  }, [])

  const set = (name, value) => setFormData(p => ({ ...p, [name]: value }))

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const results = await Promise.all(files.map(async f => {
        const c = await imageCompression(f, { maxSizeMB: 0.8, maxWidthOrHeight: 1280 })
        return imageCompression.getDataUrlFromFile(c)
      }))
      setFormData(p => ({ ...p, images: [...p.images, ...results] }))
    } catch { alert("Erreur lors de la compression des images.") }
    finally { setUploading(false); e.target.value = '' }
  }

  const removeImage = (idx) => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))

  const save = async () => {
    if (!formData.title.trim()) return alert("Le titre de l'action est obligatoire.")
    if (!formData.description.trim()) return alert("La description est obligatoire.")
    if (!formData.location.trim()) return alert("La localisation est obligatoire.")
    if (!formData.project) return alert("Le projet pilier rattaché est obligatoire.")
    setSaving(true)
    try {
      if (initial?._id) await api.patch(`/actions/${initial._id}`, formData)
      else await api.post('/actions', formData)
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
              <Activity size={14} />
              <span>{initial?._id ? "Édition d'action terrain" : "Création d'action terrain"}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {initial?._id ? "Modifier l'action d'intervention" : "Nouvelle action d'intervention"}
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
            <span>{saving ? 'Enregistrement...' : initial?._id ? 'Enregistrer les modifications' : 'Créer l\'action'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        
        {/* Left Column — Details & Album */}
        <div className="space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              Détails de l'intervention
            </h3>

            <div>
              <label className="field-label flex items-center justify-between text-slate-800 font-bold mb-2">
                <span>Titre de l'action</span>
                <span className="text-rose-500 text-xs">* Requis</span>
              </label>
              <input
                value={formData.title}
                onChange={e => set('title', e.target.value)}
                className="input-field text-lg font-extrabold text-slate-900 py-3 bg-slate-50/50"
                placeholder="Ex: Atelier de sensibilisation VBG — Karimama"
              />
            </div>

            <div>
              <label className="field-label flex items-center justify-between text-slate-800 font-bold mb-2">
                <span>Description & Déroulement</span>
                <span className="text-rose-500 text-xs">* Requis</span>
              </label>
              <textarea
                value={formData.description}
                onChange={e => set('description', e.target.value)}
                rows={6}
                className="textarea-field bg-slate-50/50"
                placeholder="Contexte, objectifs, déroulement et impact de l'intervention..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label flex items-center gap-1.5 text-slate-800 font-bold mb-2">
                  <MapPin size={14} className="text-[#2764ae]" />
                  <span>Localisation</span>
                  <span className="text-rose-500 text-xs">*</span>
                </label>
                <input
                  value={formData.location}
                  onChange={e => set('location', e.target.value)}
                  className="input-field bg-slate-50/50"
                  placeholder="Ex: Parakou, Nord-Bénin"
                />
              </div>
              <div>
                <label className="field-label flex items-center gap-1.5 text-slate-800 font-bold mb-2">
                  <Users size={14} className="text-[#2764ae]" />
                  <span>Bénéficiaires</span>
                </label>
                <input
                  value={formData.beneficiaries}
                  onChange={e => set('beneficiaries', e.target.value)}
                  className="input-field bg-slate-50/50"
                  placeholder="Ex: 320 femmes"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label flex items-center gap-1.5 text-slate-800 font-bold mb-2">
                  <Calendar size={14} className="text-[#2764ae]" />
                  <span>Date de début</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => set('startDate', e.target.value)}
                  className="input-field bg-slate-50/50"
                />
              </div>
              <div>
                <label className="field-label flex items-center gap-1.5 text-slate-800 font-bold mb-2">
                  <Calendar size={14} className="text-[#2764ae]" />
                  <span>Date de fin</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => set('endDate', e.target.value)}
                  className="input-field bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Photos Album Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Album Photos de terrain ({formData.images.length})
              </h3>
              {uploading && <span className="text-xs font-bold text-[#2764ae] animate-pulse">Compression...</span>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:border-[#2764ae] hover:bg-blue-50/40 transition">
                <Upload size={24} className="text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700">Ajouter photos</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Multi-sélection</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
              </label>

              {formData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 group bg-slate-900 shadow-sm">
                  <img src={img} alt="" className="h-full w-full object-cover opacity-90" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 rounded-full bg-rose-600 p-1.5 text-white opacity-0 group-hover:opacity-100 shadow transition hover:scale-110"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column — Categorization & Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              Rattachement & Catégorisation
            </h3>

            {/* Project Parent */}
            <div>
              <label className="field-label flex items-center gap-1.5 text-slate-800 font-bold mb-2">
                <FolderKanban size={14} className="text-[#2764ae]" />
                <span>Projet Pilier rattaché</span>
                <span className="text-rose-500 text-xs">*</span>
              </label>
              <select
                value={formData.project}
                onChange={e => set('project', e.target.value)}
                className="select-field font-bold text-slate-900 bg-slate-50/50"
              >
                <option value="">-- Sélectionner un pilier --</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="field-label text-slate-800 font-bold mb-2">Catégorie thématique</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('category', c)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition border ${
                      formData.category === c
                        ? 'bg-[#2764ae] text-white border-[#2764ae] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Radio */}
            <div>
              <label className="field-label text-slate-800 font-bold mb-2">Statut de l'action</label>
              <div className="space-y-2">
                {STATUSES.map(s => {
                  const colors = {
                    'En cours': 'border-blue-500 bg-blue-50/90 text-blue-950 font-bold ring-2 ring-blue-400/30',
                    'Terminé': 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-400/30',
                    'En attente': 'border-amber-500 bg-amber-50/90 text-amber-950 font-bold ring-2 ring-amber-400/30',
                  }
                  const active = formData.status === s
                  return (
                    <label
                      key={s}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                        active ? colors[s] : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status_radio"
                        value={s}
                        checked={active}
                        onChange={() => set('status', s)}
                        className="sr-only"
                      />
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        active ? 'border-current' : 'border-slate-400'
                      }`}>
                        {active && <span className="h-2 w-2 rounded-full bg-current" />}
                      </span>
                      <span className="text-xs font-bold">{s}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <p className="text-xs font-semibold text-slate-500">
          {uploading ? '⏳ Traitement des images...' : 'ONG Busola — Galerie & Actions'}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
          <button type="button" onClick={save} disabled={saving || uploading} className="btn-primary">
            {saving ? 'Enregistrement...' : initial?._id ? 'Enregistrer les modifications' : 'Créer l\'action'}
          </button>
        </div>
      </div>
    </div>
  )
}
