import React, { useState } from 'react'
import api from './api'

const CATEGORIES = ['Action', 'Événement', 'Partenariat', 'Information']

export default function NewsForm({ onSaved, onCancel, initial }) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: initial?.title || '',
    summary: initial?.summary || '',
    content: initial?.content || '',
    category: initial?.category || 'Information',
    author: initial?.author || 'Équipe Busola',
    published: initial?.published !== undefined ? initial.published : true,
    image: initial?.image || ''
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }))
    reader.readAsDataURL(file)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (initial?._id) {
        await api.patch(`/news/${initial._id}`, formData)
      } else {
        await api.post('/news', formData)
      }
      onSaved()
    } catch (e) {
      const msg = e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement"
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-panel">
      <div className="mb-5 flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{initial?._id ? 'Modifier une actualité' : 'Nouvelle actualité'}</h3>
          <p className="text-sm text-slate-500">Renseigne un titre clair, une image légère et un résumé publiable.</p>
        </div>
        <span className={`badge ${formData.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{formData.published ? 'Publié' : 'Brouillon'}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div>
            <label className="field-label">Titre</label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Titre de l'actualité" className="input-field" />
          </div>

          <div>
            <label className="field-label">Résumé court</label>
            <input name="summary" value={formData.summary} onChange={handleChange} placeholder="Bref aperçu affiché dans les cartes" className="input-field" />
          </div>

          <div>
            <label className="field-label">Contenu</label>
            <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Texte complet" className="textarea-field min-h-44" />
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl bg-slate-50 p-4">
          <div>
            <label className="field-label">Image de couverture</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" />
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {formData.image ? (
                <img src={formData.image} alt="Aperçu" className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center text-sm text-slate-400">Aucun aperçu</div>
              )}
            </div>
            {formData.image && <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} className="mt-2 text-sm font-semibold text-red-600 hover:text-red-800">Retirer l'image</button>}
          </div>

          <div>
            <label className="field-label">Catégorie</label>
            <select name="category" value={formData.category} onChange={handleChange} className="select-field">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="field-label">Auteur</label>
            <input name="author" value={formData.author} onChange={handleChange} className="input-field" />
          </div>

          <label className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500" />
            Publier immédiatement
          </label>
        </aside>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
        <button type="button" onClick={save} disabled={saving} className="btn-primary">{saving ? 'Enregistrement...' : initial?._id ? 'Mettre à jour' : 'Publier'}</button>
      </div>
    </div>
  )
}
