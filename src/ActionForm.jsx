import React, { useState, useEffect } from 'react'
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
    if (!formData.title.trim()) return alert("Le titre est obligatoire.")
    if (!formData.description.trim()) return alert("La description est obligatoire.")
    if (!formData.location.trim()) return alert("La localisation est obligatoire.")
    if (!formData.project) return alert("Le projet pilier est obligatoire.")
    try {
      if (initial?._id) await api.patch(`/actions/${initial._id}`, formData)
      else await api.post('/actions', formData)
      onSaved()
    } catch (e) {
      alert(e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement.")
    }
  }

  return (
    <div className="modal-overlay flex items-start justify-center p-4 pt-6">
      <div className="modal-panel-lg animate-scale-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2764ae]">Programmes & Galerie Photo</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {initial?._id ? "Modifier l'action terrain" : "Nouvelle action d'intervention"}
            </h2>
          </div>
          <button onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body : 2 colonnes ── */}
        <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className="grid md:grid-cols-[1fr_340px] divide-y md:divide-y-0 md:divide-x divide-slate-100">

            {/* Colonne gauche — Informations principales */}
            <div className="px-6 py-6 space-y-5">
              <p className="form-section-title">Informations principales</p>

              <div>
                <label className="field-label">Titre de l'action <span className="text-red-400">*</span></label>
                <input value={formData.title} onChange={e => set('title', e.target.value)}
                  className="input-field" placeholder="Ex: Atelier de sensibilisation VBG — Karimama" />
              </div>

              <div>
                <label className="field-label">Description complète <span className="text-red-400">*</span></label>
                <textarea value={formData.description} onChange={e => set('description', e.target.value)}
                  rows={5} className="textarea-field"
                  placeholder="Contexte, objectifs, déroulement et impact de l'intervention..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Localisation <span className="text-red-400">*</span></label>
                  <input value={formData.location} onChange={e => set('location', e.target.value)}
                    className="input-field" placeholder="Ex: Parakou, Nord-Bénin" />
                </div>
                <div>
                  <label className="field-label">Bénéficiaires</label>
                  <input value={formData.beneficiaries} onChange={e => set('beneficiaries', e.target.value)}
                    className="input-field" placeholder="Ex: 320 femmes" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Date de début</label>
                  <input type="date" value={formData.startDate} onChange={e => set('startDate', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="field-label">Date de fin</label>
                  <input type="date" value={formData.endDate} onChange={e => set('endDate', e.target.value)} className="input-field" />
                </div>
              </div>

              {/* Album Photos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="field-label m-0">Album photos ({formData.images.length})</label>
                  {uploading && <span className="text-xs font-semibold text-[#2764ae] animate-pulse">Compression...</span>}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {/* Bouton d'ajout */}
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-[#2764ae]/50 hover:bg-blue-50/30 transition">
                    <svg className="h-6 w-6 text-slate-400 mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ajouter</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                  </label>

                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 group bg-slate-100">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                        <button onClick={() => removeImage(idx)}
                          className="scale-0 group-hover:scale-100 transition rounded-full bg-white/90 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white shadow">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">Sélectionnez plusieurs photos à la fois pour un ajout massif.</p>
              </div>
            </div>

            {/* Colonne droite — Classification & Paramètres */}
            <div className="px-6 py-6 space-y-5 bg-slate-50/50">
              <p className="form-section-title">Classification</p>

              <div>
                <label className="field-label">Projet Pilier <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select value={formData.project} onChange={e => set('project', e.target.value)} className="select-field appearance-none pr-9">
                    <option value="">-- Sélectionner un pilier --</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div>
                <label className="field-label">Catégorie thématique</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c} type="button"
                      onClick={() => set('category', c)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                        formData.category === c
                          ? 'bg-[#2764ae] text-white border-[#2764ae]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >{c}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">Statut</label>
                <div className="space-y-2">
                  {STATUSES.map(s => {
                    const colors = {
                      'En cours': 'border-blue-200 bg-blue-50 text-blue-800',
                      'Terminé': 'border-emerald-200 bg-emerald-50 text-emerald-800',
                      'En attente': 'border-amber-200 bg-amber-50 text-amber-800',
                    }
                    const active = formData.status === s
                    return (
                      <label key={s} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                        active ? colors[s] + ' ring-2 ring-offset-1 ' + (s === 'En cours' ? 'ring-blue-300' : s === 'Terminé' ? 'ring-emerald-300' : 'ring-amber-300') : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}>
                        <input type="radio" name="status" value={s} checked={active}
                          onChange={() => set('status', s)} className="sr-only" />
                        <span className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                          active ? 'border-current' : 'border-slate-300'
                        }`}>
                          {active && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                        </span>
                        <span className="text-sm font-semibold">{s}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-400">
            {uploading ? '⏳ Traitement des images...' : 'Les champs * sont obligatoires'}
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary text-sm px-5">Annuler</button>
            <button onClick={save} disabled={uploading} className="btn-primary text-sm px-5">
              {initial?._id ? 'Enregistrer les modifications' : "Créer l'action"}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
