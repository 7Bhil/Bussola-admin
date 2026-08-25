import React, { useState, useEffect } from 'react'
import { X, Upload, Activity, MapPin, Users, Calendar, FolderKanban, Check } from 'lucide-react'
import api from './api'
import imageCompression from 'browser-image-compression'

const CATEGORIES = ['Santé', 'Éducation', 'Droit', 'Social', 'Environnement']
const STATUSES = ['En cours', 'Terminé', 'En attente']
const LEGACY_TITLES = new Set(['pageda', 'yes', 'tedidjo'])
const isLegacy = (p) => LEGACY_TITLES.has(p.title.trim().toLowerCase())

export default function ActionForm({ onSaved, initial, onCancel }) {
  const [projects, setProjects] = useState([])
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
    try {
      if (initial?._id) await api.patch(`/actions/${initial._id}`, formData)
      else await api.post('/actions', formData)
      onSaved()
    } catch (e) {
      alert(e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement.")
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container-lg">

        {/* ── Fixed Header ── */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#2764ae]">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initial?._id ? "Modifier l'action terrain" : "Nouvelle action d'intervention"}
              </h2>
              <p className="text-xs font-medium text-slate-500">Programmes de terrain & Galerie d'impact</p>
            </div>
          </div>

          <button onClick={onCancel} className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition">
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="modal-body p-0">
          <div className="grid md:grid-cols-[1fr_340px] divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-0">

            {/* Left Column — Details */}
            <div className="p-6 space-y-5">
              <div>
                <label className="field-label flex items-center justify-between">
                  <span>Titre de l'action</span>
                  <span className="text-rose-500 font-bold">* Requis</span>
                </label>
                <input
                  value={formData.title}
                  onChange={e => set('title', e.target.value)}
                  className="input-field text-base font-bold"
                  placeholder="Ex: Atelier de sensibilisation VBG — Karimama"
                />
              </div>

              <div>
                <label className="field-label flex items-center justify-between">
                  <span>Description & Déroulement</span>
                  <span className="text-rose-500 font-bold">* Requis</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => set('description', e.target.value)}
                  rows={5}
                  className="textarea-field"
                  placeholder="Contexte, objectifs, déroulement et impact de l'intervention..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label flex items-center gap-1.5 text-slate-800">
                    <MapPin size={14} className="text-[#2764ae]" />
                    <span>Localisation</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    value={formData.location}
                    onChange={e => set('location', e.target.value)}
                    className="input-field"
                    placeholder="Ex: Parakou, Nord-Bénin"
                  />
                </div>
                <div>
                  <label className="field-label flex items-center gap-1.5 text-slate-800">
                    <Users size={14} className="text-[#2764ae]" />
                    <span>Bénéficiaires</span>
                  </label>
                  <input
                    value={formData.beneficiaries}
                    onChange={e => set('beneficiaries', e.target.value)}
                    className="input-field"
                    placeholder="Ex: 320 femmes"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label flex items-center gap-1.5 text-slate-800">
                    <Calendar size={14} className="text-[#2764ae]" />
                    <span>Date de début</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => set('startDate', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="field-label flex items-center gap-1.5 text-slate-800">
                    <Calendar size={14} className="text-[#2764ae]" />
                    <span>Date de fin</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => set('endDate', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Album Photos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="field-label m-0 text-slate-800">
                    Album photos ({formData.images.length})
                  </label>
                  {uploading && <span className="text-xs font-bold text-[#2764ae] animate-pulse">Compression...</span>}
                </div>

                <div className="grid grid-cols-4 gap-2.5 mt-2">
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-[#2764ae] hover:bg-blue-50/30 transition">
                    <Upload size={20} className="text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Ajouter</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                  </label>

                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-xl border border-slate-300 group bg-slate-900">
                      <img src={img} alt="" className="h-full w-full object-cover opacity-90" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 rounded-full bg-rose-600 p-1 text-white opacity-0 group-hover:opacity-100 shadow transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column — Categorization */}
            <div className="p-6 space-y-6 bg-slate-50/70">
              <div>
                <label className="field-label flex items-center gap-1.5 text-slate-800">
                  <FolderKanban size={14} className="text-[#2764ae]" />
                  <span>Projet Pilier rattaché</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <select
                  value={formData.project}
                  onChange={e => set('project', e.target.value)}
                  className="select-field font-bold text-slate-900"
                >
                  <option value="">-- Sélectionner un pilier --</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>

              <div>
                <label className="field-label text-slate-800">Catégorie thématique</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('category', c)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition border ${
                        formData.category === c
                          ? 'bg-[#2764ae] text-white border-[#2764ae] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label text-slate-800">Statut de l'action</label>
                <div className="space-y-2 mt-2">
                  {STATUSES.map(s => {
                    const colors = {
                      'En cours': 'border-blue-500 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-400/30',
                      'Terminé': 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/30',
                      'En attente': 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-400/30',
                    }
                    const active = formData.status === s
                    return (
                      <label
                        key={s}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                          active ? colors[s] : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
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

        {/* ── Fixed Footer ── */}
        <div className="modal-footer">
          <p className="text-xs font-semibold text-slate-500">
            {uploading ? '⏳ Traitement des images...' : 'Actions ONG Busola'}
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary">Annuler</button>
            <button onClick={save} disabled={uploading} className="btn-primary">
              <Check size={16} />
              <span>{initial?._id ? 'Enregistrer les modifications' : "Créer l'action"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
