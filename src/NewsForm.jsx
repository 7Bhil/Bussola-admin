import React, { useState } from 'react'
import { ArrowLeft, Upload, Newspaper, Tag, User, CheckCircle, AlertCircle, Image as ImageIcon, Check } from 'lucide-react'
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
              <Newspaper size={14} />
              <span>{initial?._id ? "Édition de publication" : "Création de publication"}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {initial?._id ? "Modifier l'actualité" : "Nouvelle actualité / Communiqué"}
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
            <span>{saving ? 'Enregistrement...' : initial?._id ? 'Enregistrer les modifications' : 'Publier l\'actualité'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Content Grid */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        
        {/* Left Column — Article Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <label className="field-label flex items-center justify-between text-slate-800 font-bold mb-2">
              <span>Titre principal de l'article</span>
              <span className="text-rose-500 text-xs">* Requis</span>
            </label>
            <input
              value={formData.title}
              onChange={e => set('title', e.target.value)}
              className="input-field text-lg font-extrabold text-slate-900 py-3 bg-slate-50/50"
              placeholder="Ex: Lancement du programme PAGEDA dans le Nord-Bénin"
            />
          </div>

          <div>
            <label className="field-label flex items-center justify-between text-slate-800 font-bold mb-2">
              <span>Résumé court (Affiché dans les cartes & aperçus)</span>
              <span className="text-rose-500 text-xs">* Requis</span>
            </label>
            <textarea
              value={formData.summary}
              onChange={e => set('summary', e.target.value)}
              rows={3}
              className="textarea-field bg-slate-50/50"
              placeholder="Une phrase percutante qui résume l'essentiel pour le lecteur..."
            />
          </div>

          <div>
            <label className="field-label text-slate-800 font-bold mb-2">Contenu complet de la publication</label>
            <textarea
              value={formData.content}
              onChange={e => set('content', e.target.value)}
              rows={12}
              className="textarea-field bg-slate-50/50"
              placeholder="Rédigez l'intégralité de votre communiqué ou article ici..."
            />
          </div>
        </div>

        {/* Right Column — Settings & Image */}
        <div className="space-y-6">
          
          {/* Settings Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              Paramètres de publication
            </h3>

            {/* Category */}
            <div>
              <label className="field-label flex items-center gap-1.5 text-slate-800 font-bold mb-2">
                <Tag size={14} className="text-[#2764ae]" />
                <span>Catégorie</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('category', c)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-bold transition border ${
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

            {/* Author */}
            <div>
              <label className="field-label flex items-center gap-1.5 text-slate-800 font-bold mb-2">
                <User size={14} className="text-[#2764ae]" />
                <span>Auteur</span>
              </label>
              <input
                value={formData.author}
                onChange={e => set('author', e.target.value)}
                className="input-field bg-slate-50/50 font-medium"
                placeholder="Ex: Équipe Busola"
              />
            </div>

            {/* Status Radio */}
            <div>
              <label className="field-label text-slate-800 font-bold mb-2">Statut de publication</label>
              <div className="space-y-2">
                {[true, false].map(pub => (
                  <label
                    key={String(pub)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                      formData.published === pub
                        ? pub
                          ? 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-400/30'
                          : 'border-amber-500 bg-amber-50/90 text-amber-950 font-bold ring-2 ring-amber-400/30'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
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
                      <p className="text-xs font-bold">{pub ? 'Publié (En ligne)' : 'Brouillon (Masqué)'}</p>
                      <p className="text-[11px] font-normal text-slate-500">
                        {pub ? 'Visible sur le site public' : 'Enregistré sans publication'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Cover Image Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <label className="field-label flex items-center gap-1.5 text-slate-800 font-bold">
              <ImageIcon size={14} className="text-[#2764ae]" />
              <span>Image de couverture</span>
            </label>

            {formData.image ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 group">
                <img src={formData.image} alt="Aperçu" className="h-48 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('image', '')}
                  className="absolute top-3 right-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
                >
                  Supprimer l'image
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:border-[#2764ae] hover:bg-blue-50/40 transition">
                <Upload size={28} className="text-slate-400" />
                <p className="text-xs font-bold text-slate-700">Importer une image de couverture</p>
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
          {uploading ? '⏳ Traitement de l\'image...' : 'Modifications prêtes à être publiées'}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
          <button type="button" onClick={save} disabled={saving || uploading} className="btn-primary">
            {saving ? 'Enregistrement...' : initial?._id ? 'Enregistrer les modifications' : 'Publier l\'actualité'}
          </button>
        </div>
      </div>
    </div>
  )
}
