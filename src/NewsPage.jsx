import React, { useEffect, useState } from 'react'
import api from './api'
import NewsForm from './NewsForm'

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const perPage = 8

  const load = () => {
    setLoading(true)
    api.get('/news/admin').then(res => setNews(res.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!window.confirm('Supprimer cette actualité ?')) return
    try {
      await api.delete(`/news/${id}`)
      setNews(news.filter(n => n._id !== id))
    } catch (e) {
      alert('Suppression impossible')
    }
  }

  const filtered = news.filter(n => `${n.title || ''} ${n.summary || ''} ${n.category || ''}`.toLowerCase().includes(query.toLowerCase()))
  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const shown = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <div className="eyebrow">Contenus</div>
          <h2 className="page-title">Actualités</h2>
          <p className="page-subtitle">Crée, modifie et publie les informations visibles sur le site public.</p>
        </div>
        <div className="toolbar">
          <input placeholder="Rechercher une actualité" value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} className="input-field sm:w-72" />
          <button onClick={() => setEditing({})} className="btn-primary">Nouvelle actualité</button>
        </div>
      </section>

      {editing && (
        <NewsForm initial={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />
      )}

      <div className="table-wrap">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Titre</th>
                <th className="table-cell">Catégorie</th>
                <th className="table-cell">Statut</th>
                <th className="table-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan="4" className="table-cell text-center text-slate-500">Chargement des actualités...</td></tr>
              ) : shown.length === 0 ? (
                <tr><td colSpan="4" className="table-cell text-center text-slate-500">Aucune actualité trouvée.</td></tr>
              ) : shown.map(n => (
                <tr key={n._id} className="hover:bg-slate-50/70">
                  <td className="table-cell">
                    <div className="font-semibold text-slate-950">{n.title}</div>
                    <div className="mt-1 line-clamp-2 max-w-xl text-sm leading-6 text-slate-500">{n.summary || 'Aucun résumé renseigné.'}</div>
                  </td>
                  <td className="table-cell"><span className="badge bg-blue-100 text-blue-800">{n.category || 'Information'}</span></td>
                  <td className="table-cell"><span className={`badge ${n.published === false ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{n.published === false ? 'Brouillon' : 'Publié'}</span></td>
                  <td className="table-cell">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(n)} className="btn-secondary px-3 py-2">Éditer</button>
                      <button onClick={() => del(n._id)} className="btn-danger">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row">
        <div>{filtered.length} actualité{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="btn-secondary px-3 py-2">Précédent</button>
          <span className="px-2 font-semibold text-slate-800">Page {page}/{pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => Math.min(p + 1, pages))} className="btn-secondary px-3 py-2">Suivant</button>
        </div>
      </div>
    </div>
  )
}
