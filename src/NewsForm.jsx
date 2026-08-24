import React, { useState } from 'react'
import { X, Upload, Newspaper, Tag, User, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
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
    } catch { alert("Erreur lors de la compression de l'image.") }
    finally { setUploading(false) }
  }

  const save = async () => {
    if (!formData.title.trim()) return alert("Le titre principal est obligatoire.")
    if (!formData.summary.trim()) return alert("Le résumé court est obligatoire.")
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
    <div className="modal-overlay">
      <div className="modal-container-lg">

        {/* ── Fixed Header ── */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#2764ae]">
              <Newspaper size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initial?._id ? "Modifier l'actualité" : "Nouvelle actualité / Communiqué"}
              </h2>
              <p className="text-xs font-medium text-slate-500">Publication sur le site public Busola</p>
            </div>
          </div>

          <button onClick={onCancel} className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition">
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="modal-body p-0">
          <div className="grid md:grid-cols-[1fr_320px] divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-0">

            {/* Left Column — Content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="field-label flex items-center justify-between">
                  <span>Titre principal</span>
                  <span className="text-rose-500 font-bold">* Requis</span>
                </label>
                <input
                  value={formData.title}
                  onChange={e => set('title', e.target.value)}
                  className="input-field text-base font-bold text-slate-900"
                  placeholder="Ex: Lancement du programme PAGEDA dans le Nord-Bénin"
                />
              </div>

              <div>
                <label className="field-label flex items-center justify-between">
                  <span>Résumé court (Affiché dans les listes & aperçus)</span>
                  <span className="text-rose-500 font-bold">* Requis</span>
                </label>
                <textarea
                  value={formData.summary}
                  onChange={e => set('summary', e.target.value)}
                  rows={3}
                  className="textarea-field"
                  placeholder="Une phrase percutante qui résume l'essentiel pour le lecteur..."
                />
              </div>

              <div>
                <label className="field-label">Contenu complet de l'article</label>
                <textarea
                  value={formData.content}
                  onChange={e => set('content', e.target.value)}
                  rows={9}
                  className="textarea-field"
                  placeholder="Rédigez l'intégralité de votre communiqué ou article ici..."
                />
              </div>
            </div>

            {/* Right Column — Sidebar Parameters */}
            <div className="p-6 space-y-6 bg-slate-50/70">
              {/* Category */}
              <div>
                <label className="field-label flex items-center gap-1.5 text-slate-800">
                  <Tag size={14} className="text-[#2764ae]" />
                  <span>Catégorie</span>
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
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

              {/* Author */}
              <div>
                <label className="field-label flex items-center gap-1.5 text-slate-800">
                  <User size={14} className="text-[#2764ae]" />
                  <span>Auteur de l'article</span>
                </label>
                <input
                  value={formData.author}
                  onChange={e => set('author', e.target.value)}
                  className="input-field"
                  placeholder="Ex: Équipe Busola"
                />
              </div>

              {/* Published Radio */}
              <div>
                <label className="field-label text-slate-800">Statut de publication</label>
                <div className="space-y-2 mt-2">
                  {[true, false].map(pub => (
                    <label
                      key={String(pub)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                        formData.published === pub
                          ? pub
                            ? 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-400/30'
                            : 'border-amber-500 bg-amber-50/90 text-amber-950 font-bold ring-2 ring-amber-400/30'
                          : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="published_status"
                        checked={formData.published === pub}
                        onChange={() => set('published', pub)}
                        className="sr-only"
                      />
                      {pub ? <CheckCircle size={18} className="text-emerald-600 shrink-0" /> : <AlertCircle size={18} className="text-amber-600 shrink-0" />}
                      <div>
                        <p className="text-xs font-bold">{pub ? 'Publié' : 'Brouillon'}</p>
                        <p className="text-[11px] font-normal text-slate-500">
                          {pub ? 'Visible instantanément' : 'Masqué du public'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Image Cover */}
              <div>
                <label className="field-label flex items-center gap-1.5 text-slate-800">
                  <ImageIcon size={14} className="text-[#2764ae]" />
                  <span>Image de couverture</span>
                </label>

                {formData.image ? (
                  <div className="relative mt-2 overflow-hidden rounded-xl border border-slate-300 bg-slate-900 group">
                    <img src={formData.image} alt="Aperçu" className="h-36 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => set('image', '')}
                      className="absolute top-2 right-2 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-5 text-center hover:border-[#2764ae] hover:bg-blue-50/40 transition mt-2">
                    <Upload size={24} className="text-slate-400" />
                    <p className="text-xs font-bold text-slate-700">Importer une image</p>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Fixed Footer (Always visible) ── */}
        <div className="modal-footer">
          <p className="text-xs font-semibold text-slate-500">
            {uploading ? '⏳ Compression en cours...' : 'ONG Busola — Contenus'}
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary">Annuler</button>
            <button onClick={save} disabled={saving || uploading} className="btn-primary">
              {saving ? 'Enregistrement...' : initial?._id ? 'Enregistrer les modifications' : 'Publier'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
