import React, { useState } from 'react'
import api from './api'
import imageCompression from 'browser-image-compression'

const CATEGORIES = ['Action', 'Événement', 'Partenariat', 'Information']

export default function NewsForm({ onSaved, onCancel, initial }) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: initial?.title || '',
    summary: initial?.summary || '',
    content: initial?.content || '',
    category: initial?.category || 'Information',
    author: initial?.author || 'Équipe Busola',
    published: initial?.published !== undefined ? initial.published : true,
    image: initial?.image || ''
  })

  const set = (name, value) => setFormData(p => ({ ...p, [name]: value }))

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const c = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1400 })
      const b64 = await imageCompression.getDataUrlFromFile(c)
      set('image', b64)
    } catch { alert("Erreur lors du traitement de l'image.") }
    finally { setUploading(false) }
  }

  const save = async () => {
    if (!formData.title.trim()) return alert("Le titre est obligatoire.")
    if (!formData.summary.trim()) return alert("Le résumé est obligatoire.")
    setSaving(true)
    try {
      if (initial?._id) await api.patch(`/news/${initial._id}`, formData)
      else await api.post('/news', formData)
      onSaved()
    } catch (e) {
      alert(e.response?.data?.details || e.response?.data?.message || "Erreur lors de l'enregistrement.")
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay flex items-start justify-center p-4 pt-6">
      <div className="modal-panel-lg animate-scale-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2764ae]">Contenus & Médias</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {initial?._id ? "Modifier l'actualité" : 'Nouvelle actualité / Communiqué'}
            </h2>
          </div>
          <button onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body 2 colonnes ── */}
        <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className="grid md:grid-cols-[1fr_300px] divide-y md:divide-y-0 md:divide-x divide-slate-100">

            {/* Colonne principale */}
            <div className="px-6 py-6 space-y-5">
              <p className="form-section-title">Contenu de l'article</p>

              <div>
                <label className="field-label">Titre principal <span className="text-red-400">*</span></label>
                <input value={formData.title} onChange={e => set('title', e.target.value)}
                  className="input-field text-base font-semibold"
                  placeholder="Ex: Lancement du programme PAGEDA dans le Nord-Bénin" />
              </div>

              <div>
                <label className="field-label">Résumé court (aperçu en liste) <span className="text-red-400">*</span></label>
                <textarea value={formData.summary} onChange={e => set('summary', e.target.value)}
                  rows={2} className="textarea-field"
                  placeholder="Une phrase qui accroche le lecteur et résume l'essentiel..." />
              </div>

              <div>
                <label className="field-label">Contenu complet</label>
                <textarea value={formData.content} onChange={e => set('content', e.target.value)}
                  rows={8} className="textarea-field"
                  placeholder="Rédigez ici l'intégralité de votre article..." />
              </div>
            </div>

            {/* Colonne droite — Paramètres */}
            <div className="px-6 py-6 space-y-5 bg-slate-50/50">
              <p className="form-section-title">Paramètres</p>

              <div>
                <label className="field-label">Catégorie</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c} type="button" onClick={() => set('category', c)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                        formData.category === c
                          ? 'bg-[#2764ae] text-white border-[#2764ae]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >{c}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">Auteur</label>
                <input value={formData.author} onChange={e => set('author', e.target.value)}
                  className="input-field" placeholder="Équipe Busola" />
              </div>

              {/* Publication */}
              <div>
                <label className="field-label">Statut de publication</label>
                <div className="space-y-2">
                  {[true, false].map(pub => (
                    <label key={String(pub)} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                      formData.published === pub
                        ? pub
                          ? 'border-emerald-200 bg-emerald-50 ring-2 ring-emerald-200 ring-offset-1'
                          : 'border-amber-200 bg-amber-50 ring-2 ring-amber-200 ring-offset-1'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}>
                      <input type="radio" checked={formData.published === pub}
                        onChange={() => set('published', pub)} className="sr-only" />
                      <span className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                        formData.published === pub
                          ? pub ? 'border-emerald-500' : 'border-amber-500'
                          : 'border-slate-300'
                      }`}>
                        {formData.published === pub && (
                          <span className={`h-1.5 w-1.5 rounded-full ${pub ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        )}
                      </span>
                      <div>
                        <p className={`text-sm font-semibold ${pub ? 'text-emerald-800' : 'text-amber-800'}`}>
                          {pub ? 'Publié' : 'Brouillon'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {pub ? 'Visible sur le site public' : 'Non visible pour les visiteurs'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="field-label">Image de couverture</label>
                {formData.image ? (
                  <div className="relative overflow-hidden rounded-xl border border-slate-200">
                    <img src={formData.image} alt="" className="h-36 w-full object-cover" />
                    <button onClick={() => set('image', '')}
                      className="absolute top-2 right-2 rounded-md bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 transition">
                      Retirer
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white py-8 text-center hover:border-[#2764ae]/50 hover:bg-blue-50/20 transition">
                    <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-xs font-semibold text-slate-600">Ajouter une image</p>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-400">
            {uploading ? '⏳ Compression...' : 'Les champs * sont obligatoires'}
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary text-sm px-5">Annuler</button>
            <button onClick={save} disabled={saving || uploading} className="btn-primary text-sm px-5">
              {saving ? 'Publication...' : initial?._id ? 'Enregistrer les modifications' : 'Publier'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
