import React, { useEffect, useState } from 'react'
import {
  Newspaper,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Tag,
  Eye,
  Filter
} from 'lucide-react'
import api from './api'
import NewsForm from './NewsForm'

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const perPage = 8

  const load = () => {
    setLoading(true)
    api.get('/news/admin')
      .then(res => setNews(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const del = async (id, title) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'actualité "${title}" ?`)) return
    try {
      await api.delete(`/news/${id}`)
      setNews(news.filter(n => n._id !== id))
    } catch (e) {
      alert('Suppression impossible. Vérifiez vos permissions.')
    }
  }

  const filtered = news.filter(n => {
    const matchesSearch = `${n.title || ''} ${n.summary || ''} ${n.category || ''} ${n.author || ''}`
      .toLowerCase()
      .includes(query.toLowerCase())

    const matchesCategory = selectedCategory === 'ALL' || n.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const shown = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="page-shell">
      {/* Header Corporate */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2764ae]">
            <Newspaper size={16} />
            <span>Gestion des Contenus & Média</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Actualités & Publications</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Publiez les communiqués, rapports et actualités visibles sur le site public de l'ONG Busola.
          </p>
        </div>

        <button
          onClick={() => setEditing({})}
          className="btn-primary inline-flex items-center gap-2 bg-[#2764ae] hover:bg-[#1f5291] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Nouvelle actualité</span>
        </button>
      </section>

      {/* Barre de Recherche et Filtres */}
      <section className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, résumé ou auteur..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            className="input-field pl-10 py-2 text-sm w-full bg-white border-slate-200 rounded-xl"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => { setSelectedCategory(e.target.value); setPage(1) }}
          className="input-field text-xs font-bold py-2 bg-white border-slate-200 rounded-xl sm:w-48"
        >
          <option value="ALL">Toutes les catégories</option>
          <option value="Action">Action</option>
          <option value="Événement">Événement</option>
          <option value="Partenariat">Partenariat</option>
          <option value="Information">Information</option>
        </select>
      </section>

      {/* Formulaire Modal */}
      {editing && (
        <NewsForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}

      {/* Table des Actualités */}
      <div className="table-wrap mt-6 rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4">Auteur</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center text-slate-400">Chargement...</td></tr>
              ) : shown.length === 0 ? (
                <tr><td colSpan="5" className="py-12 text-center text-slate-400">Aucune actualité trouvée.</td></tr>
              ) : (
                shown.map(n => (
                  <tr key={n._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {n.image ? (
                          <img src={n.image} alt="" className="h-11 w-11 rounded-xl object-cover border border-slate-200 shrink-0" />
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#2764ae] flex items-center justify-center font-bold text-xs shrink-0">
                            NEWS
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{n.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-md">{n.summary || 'Aucun résumé'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="badge bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {n.category || 'Information'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <User size={13} className="text-slate-400" />
                        <span>{n.author || 'Équipe Busola'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {n.published === false ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                          <Clock size={12} />
                          <span>Brouillon</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          <span>Publié</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing(n)}
                          className="btn-secondary py-1.5 px-3 text-xs font-bold"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => del(n._id, n.title)}
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
          <span className="text-slate-900">{filtered.length}</span> actualité{filtered.length > 1 ? 's' : ''}
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
