import React, { useState, useEffect } from 'react'
import { X, Upload, Activity, FolderKanban, MapPin, Calendar, Users, Plus, Check } from 'lucide-react'
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
    api.get('/projects')
      .then(res => {
        const filtered = res.data
          .filter(p => !isLegacy(p))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title))
        setProjects(filtered)

        // Sélectionner par défaut le premier projet si non défini
        if (!formData.project && filtered.length > 0) {
          setFormData(prev => ({ ...prev, project: filtered[0]._id }))
        }
      })
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1280, useWebWorker: true }

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
      console.error('Erreur compression:', error)
      alert("Erreur lors de la compression des images.")
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const save = async () => {
    if (!formData.title.trim()) return alert("Le titre de l'action est obligatoire.")
    if (!formData.description.trim()) return alert("La description est obligatoire.")
    if (!formData.location.trim()) return alert("La localisation est obligatoire.")
    if (!formData.project) return alert("Veuillez rattacher cette action à un projet pilier.")

    try {
      if (initial?._id) {
        await api.patch(`/actions/${initial._id}`, formData)
      } else {
        await api.post('/actions', formData)
      }
      onSaved()
    } catch (e) {
      const msg = e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement."
      alert(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[#2764ae]">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initial?._id ? 'Modifier l’action terrain' : 'Nouvelle action / Programme'}
              </h3>
              <p className="text-xs text-slate-500">Renseignez les détails et photos de l'intervention.</p>
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
                Titre de l'action / intervention *
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Distribution de kits scolaires aux filles déplacées"
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Projet Pilier rattaché *
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="input-field w-full text-sm font-semibold rounded-xl border-slate-200 bg-blue-50/50 py-2.5 text-[#2764ae]"
                required
              >
                <option value="">-- Sélectionner un projet parent --</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Description de l'action *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Détaillez le déroulement, le contexte, les résultats et l'impact..."
                className="input-field w-full h-28 text-sm rounded-xl border-slate-200 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin size={13} className="text-slate-400" />
                <span>Localisation *</span>
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Bukavu, Sud-Kivu"
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Catégorie thématique
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <Users size={13} className="text-slate-400" />
                <span>Bénéficiaires</span>
              </label>
              <input
                name="beneficiaries"
                value={formData.beneficiaries}
                onChange={handleChange}
                placeholder="Ex: 150 femmes autonomisées"
                className="input-field w-full text-sm rounded-xl border-slate-200 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Date de début
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input-field w-full text-sm rounded-xl border-slate-200 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Date de fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="input-field w-full text-sm rounded-xl border-slate-200 py-2"
                />
              </div>
            </div>

            {/* Album Photos Multiple */}
            <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Album photo ({formData.images.length})</span>
                {uploading && <span className="text-xs text-[#2764ae] animate-pulse">Compression en cours...</span>}
              </label>

              <div className="flex flex-wrap gap-3">
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-[#2764ae] hover:bg-blue-50/50 transition">
                  <Plus size={24} className="text-slate-400 mb-0.5" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Ajouter</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>

                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 group bg-slate-900">
                    <img src={img} alt="Aperçu" className="h-full w-full object-cover opacity-90" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition"
                      title="Supprimer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
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
            disabled={uploading}
            className="btn-primary inline-flex items-center gap-2 bg-[#2764ae] hover:bg-[#1f5291] text-white px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Check size={16} />
            <span>{uploading ? 'Traitement...' : (initial?._id ? 'Sauvegarder' : 'Créer l’action')}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
