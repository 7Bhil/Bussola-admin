import React, { useEffect, useState } from 'react'
import {
  Quote,
  Plus,
  Search,
  Edit3,
  Trash2,
  Star,
  MapPin,
  Home,
  Activity,
  Archive,
  User,
  CheckCircle2
} from 'lucide-react'
import api from './api'
import TestimonialForm from './TestimonialForm'

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const perPage = 8

  const load = () => {
    setLoading(true)
    api.get('/testimonials/admin')
      .then(res => setTestimonials(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const del = async (id, name) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le témoignage de "${name}" ?`)) return
    try {
      await api.delete(`/testimonials/${id}`)
      setTestimonials(testimonials.filter(t => t._id !== id))
    } catch (e) {
      alert('Suppression impossible. Vérifiez vos permissions.')
    }
  }

  const filtered = testimonials.filter(t =>
    `${t.name || ''} ${t.role || ''} ${t.message || ''} ${t.location || ''}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const shown = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="page-shell">
      {/* Header Corporate */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2764ae]">
            <Quote size={16} />
            <span>Gestion de l'Impact & Retours</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Témoignages & Récits</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Organisez les témoignages des bénéficiaires et partenaires affichés sur la plateforme.
          </p>
        </div>

        <button
          onClick={() => setEditing({})}
          className="btn-primary inline-flex items-center gap-2 bg-[#2764ae] hover:bg-[#1f5291] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Nouveau témoignage</span>
        </button>
      </section>

      {/* Recherche */}
      <section className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un témoin par nom, rôle ou message..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            className="input-field pl-10 py-2 text-sm w-full bg-white border-slate-200 rounded-xl"
          />
        </div>
      </section>

      {/* Modal Form */}
      {editing && (
        <TestimonialForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}

      {/* Table des Témoignages */}
      <div className="table-wrap mt-6 rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Témoin</th>
                <th className="py-3.5 px-4">Témoignage</th>
                <th className="py-3.5 px-4">Note</th>
                <th className="py-3.5 px-4">Visibilité</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center text-slate-400">Chargement...</td></tr>
              ) : shown.length === 0 ? (
                <tr><td colSpan="5" className="py-12 text-center text-slate-400">Aucun témoignage trouvé.</td></tr>
              ) : (
                shown.map(t => (
                  <tr key={t._id} className={`hover:bg-slate-50/80 transition-colors ${t.archived ? 'opacity-50 bg-slate-50/50' : ''}`}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {t.image ? (
                          <img src={t.image} alt={t.name} className="h-11 w-11 rounded-full object-cover border border-slate-200 shrink-0" />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
                            {t.name ? t.name.charAt(0).toUpperCase() : 'T'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-xs font-medium text-slate-500">{t.role}</div>
                          {t.location && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} />
                              <span>{t.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-sm">
                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 font-medium italic">
                        "{t.message}"
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {t.showOnHome && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <Home size={11} />
                            <span>Accueil</span>
                          </span>
                        )}
                        {t.showOnActions && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                            <Activity size={11} />
                            <span>Actions</span>
                          </span>
                        )}
                        {t.archived && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                            <Archive size={11} />
                            <span>Archivé</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing(t)}
                          className="btn-secondary py-1.5 px-3 text-xs font-bold"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => del(t._id, t.name)}
                          className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-bold text-slate-600 shadow-sm">
        <div>
          Affichage de <span className="text-slate-900">{filtered.length > 0 ? (page - 1) * perPage + 1 : 0}</span> à{' '}
          <span className="text-slate-900">{Math.min(page * perPage, filtered.length)}</span> sur{' '}
          <span className="text-slate-900">{filtered.length}</span> témoignage{filtered.length > 1 ? 's' : ''}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-100 disabled:opacity-40 transition"
          >
            Précédent
          </button>

          <span className="px-2 font-semibold text-slate-900">
            Page {page} / {pages}
          </span>

          <button
            disabled={page >= pages}
            onClick={() => setPage(p => Math.min(p + 1, pages))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-100 disabled:opacity-40 transition"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}
