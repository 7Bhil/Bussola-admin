import React, { useEffect, useState } from 'react'
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
      .then(res => setTestimonials(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!window.confirm('Supprimer ce témoignage ?')) return
    try {
      await api.delete(`/testimonials/${id}`)
      setTestimonials(testimonials.filter(t => t._id !== id))
    } catch (e) {
      alert('Suppression impossible')
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
      <section className="page-header">
        <div>
          <div className="eyebrow">Contenus</div>
          <h2 className="page-title">Témoignages</h2>
          <p className="page-subtitle">Crée, modifie et organise les témoignages et impacts affichés sur le site.</p>
        </div>
        <div className="toolbar">
          <input 
            placeholder="Rechercher un témoignage" 
            value={query} 
            onChange={e => { setQuery(e.target.value); setPage(1) }} 
            className="input-field sm:w-72" 
          />
          <button onClick={() => setEditing({})} className="btn-primary">Nouveau témoignage</button>
        </div>
      </section>

      {editing && (
        <TestimonialForm 
          initial={editing} 
          onCancel={() => setEditing(null)} 
          onSaved={() => { setEditing(null); load() }} 
        />
      )}

      <div className="table-wrap">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Témoin</th>
                <th className="table-cell">Message</th>
                <th className="table-cell">Note</th>
                <th className="table-cell">Affichage</th>
                <th className="table-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan="5" className="table-cell text-center text-slate-500">Chargement des témoignages...</td></tr>
              ) : shown.length === 0 ? (
                <tr><td colSpan="5" className="table-cell text-center text-slate-500">Aucun témoignage trouvé.</td></tr>
              ) : shown.map(t => (
                <tr key={t._id} className={`hover:bg-slate-50/70 ${t.archived ? 'opacity-60 bg-slate-50/30' : ''}`}>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      {t.image ? (
                        <img src={t.image} alt={t.name} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 font-bold text-emerald-800 text-sm">
                          {t.name ? t.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-950">{t.name}</div>
                        <div className="text-xs text-slate-500">{t.role}</div>
                        {t.location && <div className="text-[10px] text-slate-400 mt-0.5">{t.location}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell max-w-xs">
                    <div className="line-clamp-2 text-sm text-slate-600 leading-6">{t.message}</div>
                  </td>
                  <td className="table-cell">
                    <span className="text-amber-500 text-xs">
                      {'⭐'.repeat(t.rating || 5)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {t.showOnHome && <span className="badge bg-emerald-50 text-emerald-700">Accueil</span>}
                      {t.showOnActions && <span className="badge bg-blue-50 text-blue-700">Actions</span>}
                      {t.archived && <span className="badge bg-red-50 text-red-700">Archivé</span>}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(t)} className="btn-secondary px-3 py-2">Éditer</button>
                      <button onClick={() => del(t._id)} className="btn-danger">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row">
        <div>{filtered.length} témoignage{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="btn-secondary px-3 py-2">Précédent</button>
          <span className="px-2 font-semibold text-slate-800">Page {page}/{pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => Math.min(p + 1, pages))} className="btn-secondary px-3 py-2">Suivant</button>
        </div>
      </div>
    </div>
  )
}
