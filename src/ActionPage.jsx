import React, { useEffect, useState } from 'react'
import api from './api'
import ActionForm from './ActionForm'

export default function ActionPage() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const perPage = 8

  const load = () => {
    setLoading(true)
    api.get('/actions/admin').then(res => setItems(res.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!window.confirm('Supprimer cette action ?')) return
    try {
      await api.delete(`/actions/${id}`)
      setItems(items.filter(i => i._id !== id))
    } catch (e) {
      alert('Suppression impossible')
    }
  }

  const filtered = items.filter(i => `${i.title || ''} ${i.description || ''} ${i.location || ''} ${i.category || ''}`.toLowerCase().includes(query.toLowerCase()))
  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const shown = filtered.slice((page - 1) * perPage, page * perPage)

  const statusClass = (status) => {
    if (status === 'Terminé') return 'bg-emerald-100 text-emerald-800'
    if (status === 'En attente') return 'bg-amber-100 text-amber-800'
    return 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <div className="eyebrow">Programmes</div>
          <h2 className="page-title">Actions</h2>
          <p className="page-subtitle">Administre les projets terrain, leurs statuts, leurs images et leurs informations publiques.</p>
        </div>
        <div className="toolbar">
          <input placeholder="Rechercher une action" value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} className="input-field sm:w-72" />
          <button onClick={() => setEditing({})} className="btn-primary">Nouvelle action</button>
        </div>
      </section>

      {editing && (
        <ActionForm initial={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />
      )}

      <div className="table-wrap">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Action</th>
                <th className="table-cell">Catégorie</th>
                <th className="table-cell">Statut</th>
                <th className="table-cell">Localisation</th>
                <th className="table-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan="5" className="table-cell text-center text-slate-500">Chargement des actions...</td></tr>
              ) : shown.length === 0 ? (
                <tr><td colSpan="5" className="table-cell text-center text-slate-500">Aucune action trouvée.</td></tr>
              ) : shown.map(i => (
                <tr key={i._id} className="hover:bg-slate-50/70">
                  <td className="table-cell">
                    <div className="font-semibold text-slate-950">{i.title}</div>
                    <div className="mt-1 line-clamp-2 max-w-xl text-sm leading-6 text-slate-500">{i.description || 'Aucune description renseignée.'}</div>
                  </td>
                  <td className="table-cell"><span className="badge bg-slate-100 text-slate-700">{i.category || 'Social'}</span></td>
                  <td className="table-cell"><span className={`badge ${statusClass(i.status)}`}>{i.status || 'En cours'}</span></td>
                  <td className="table-cell text-sm text-slate-600">{i.location || 'Non renseignée'}</td>
                  <td className="table-cell">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(i)} className="btn-secondary px-3 py-2">Éditer</button>
                      <button onClick={() => del(i._id)} className="btn-danger">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row">
        <div>{filtered.length} action{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="btn-secondary px-3 py-2">Précédent</button>
          <span className="px-2 font-semibold text-slate-800">Page {page}/{pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => Math.min(p + 1, pages))} className="btn-secondary px-3 py-2">Suivant</button>
        </div>
      </div>
    </div>
  )
}
