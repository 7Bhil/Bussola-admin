import React, { useEffect, useState } from 'react'
import {
  Activity,
  Plus,
  Search,
  Grid,
  List,
  MapPin,
  Calendar,
  Users,
  Image as ImageIcon,
  FolderKanban,
  Edit3,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import api from './api'
import ActionForm from './ActionForm'

export default function ActionPage() {
  const [items, setItems] = useState([])
  const [projects, setProjects] = useState([])
  const [query, setQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedProject, setSelectedProject] = useState('ALL')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const perPage = 9

  const load = async () => {
    setLoading(true)
    try {
      const [actRes, projRes] = await Promise.all([
        api.get('/actions/admin'),
        api.get('/projects').catch(() => ({ data: [] }))
      ])

      setItems(actRes.data || [])
      setProjects(projRes.data || [])
    } catch (e) {
      console.error('Erreur chargement actions:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const del = async (id, title) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'action "${title}" ?`)) return
    try {
      await api.delete(`/actions/${id}`)
      setItems(items.filter(i => i._id !== id))
    } catch (e) {
      alert('Suppression impossible. Vérifiez vos permissions.')
    }
  }

  // Filtrage combiné (Recherche + Statut + Projet Parent)
  const filtered = items.filter(i => {
    const matchesSearch = `${i.title || ''} ${i.description || ''} ${i.location || ''} ${i.category || ''}`
      .toLowerCase()
      .includes(query.toLowerCase())

    const matchesStatus = selectedStatus === 'ALL' || i.status === selectedStatus

    const projId = typeof i.project === 'object' ? i.project?._id : i.project
    const matchesProject = selectedProject === 'ALL' || projId === selectedProject

    return matchesSearch && matchesStatus && matchesProject
  })

  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const shown = filtered.slice((page - 1) * perPage, page * perPage)

  const statusBadge = (status) => {
    if (status === 'Terminé') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={13} />
          <span>Terminé</span>
        </span>
      )
    }
    if (status === 'En attente') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
          <Clock size={13} />
          <span>En attente</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
        <Activity size={13} />
        <span>En cours</span>
      </span>
    )
  }

  // Trouver le nom d'un projet pour affichage
  const getProjectName = (action) => {
    if (!action.project) return 'Aucun pilier'
    if (typeof action.project === 'object') return action.project.title
    const found = projects.find(p => p._id === action.project || p.pillar === action.project)
    return found ? found.title : 'Projet rattaché'
  }

  if (editing) {
    return (
      <div className="page-shell">
        <ActionForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      </div>
    )
  }

  return (
    <div className="page-shell">
      {/* Header Corporate */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2764ae]">
            <Activity size={16} />
            <span>Programmes & Galerie Photo</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Actions de terrain</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Gérez les interventions de l'ONG Busola, leurs albums photos et leur lien avec les projets piliers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Controls mode d'affichage */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vue en grille"
            >
              <Grid size={16} />
              <span className="hidden sm:inline">Grille</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vue en tableau"
            >
              <List size={16} />
              <span className="hidden sm:inline">Tableau</span>
            </button>
          </div>

          <button
            onClick={() => setEditing({})}
            className="btn-primary inline-flex items-center gap-2 bg-[#2764ae] hover:bg-[#1f5291] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition"
          >
            <Plus size={18} />
            <span>Nouvelle action</span>
          </button>
        </div>
      </section>

      {/* Barre de Recherche et Filtres */}
      <section className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, ville, catégorie..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            className="input-field pl-10 py-2 text-sm w-full bg-white border-slate-200 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filtre Projet Parent */}
          <select
            value={selectedProject}
            onChange={e => { setSelectedProject(e.target.value); setPage(1) }}
            className="input-field text-xs font-bold py-2 bg-white border-slate-200 rounded-xl"
          >
            <option value="ALL">Tous les projets piliers</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>

          {/* Filtre Statut */}
          <select
            value={selectedStatus}
            onChange={e => { setSelectedStatus(e.target.value); setPage(1) }}
            className="input-field text-xs font-bold py-2 bg-white border-slate-200 rounded-xl"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="En attente">En attente</option>
          </select>
        </div>
      </section>



      {/* ── 1. VUE EN GRILLE ── */}
      {viewMode === 'grid' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-sm font-semibold text-slate-400 animate-pulse">
              Chargement des actions...
            </div>
          ) : shown.length === 0 ? (
            <div className="col-span-full py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8">
              <Activity size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">Aucune action trouvée</h3>
              <p className="text-xs text-slate-500 mt-1">Modifiez vos critères de recherche ou ajoutez une action.</p>
            </div>
          ) : (
            shown.map(action => {
              const projTitle = getProjectName(action)
              const photoCount = action.images?.length || 0

              return (
                <div
                  key={action._id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300"
                >
                  <div>
                    {/* Cover photo */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                      <img
                        src={(action.images && action.images.length > 0 ? action.images[0] : '/optimized/cta-2.webp').replace('/large/', '/thumbs/')}
                        alt={action.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                        onError={(e) => { e.currentTarget.src = '/optimized/cta-2.webp' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      {/* Header overlay badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        {statusBadge(action.status)}
                        
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 text-xs font-bold border border-white/20">
                          <ImageIcon size={13} />
                          <span>{photoCount} photo{photoCount > 1 ? 's' : ''}</span>
                        </span>
                      </div>

                      {/* Dynamic Parent project pill */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 bg-blue-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-blue-400/30">
                          <FolderKanban size={11} />
                          <span className="truncate">{projTitle}</span>
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-[#2764ae] transition-colors">
                        {action.title}
                      </h3>

                      <p className="text-xs font-medium leading-relaxed text-slate-600 line-clamp-2">
                        {action.description || 'Aucune description fournie.'}
                      </p>

                      <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500 border-t border-slate-100">
                        {action.location && (
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <MapPin size={13} className="text-slate-400" />
                            <span>{action.location}</span>
                          </span>
                        )}

                        {action.beneficiaries && (
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <Users size={13} className="text-slate-400" />
                            <span>{action.beneficiaries}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
                    <span className="badge bg-slate-200/70 text-slate-700 text-[11px]">
                      {action.category || 'Général'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditing(action)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Edit3 size={14} className="text-slate-500" />
                        <span>Éditer</span>
                      </button>

                      <button
                        onClick={() => del(action._id, action.title)}
                        className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 transition"
                        title="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── 2. VUE EN TABLEAU ── */}
      {viewMode === 'table' && (
        <div className="table-wrap mt-6 rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Action & Description</th>
                  <th className="py-3.5 px-4">Projet Pilier</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4">Localisation</th>
                  <th className="py-3.5 px-4 text-center">Photos</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan="6" className="py-12 text-center text-slate-400">Chargement...</td></tr>
                ) : shown.length === 0 ? (
                  <tr><td colSpan="6" className="py-12 text-center text-slate-400">Aucune action trouvée.</td></tr>
                ) : (
                  shown.map(action => (
                    <tr key={action._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{action.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-md">{action.description}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="badge bg-blue-50 text-blue-800 border border-blue-200/60 font-semibold">
                          {getProjectName(action)}
                        </span>
                      </td>
                      <td className="py-4 px-4">{statusBadge(action.status)}</td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-600">
                        {action.location || 'Non renseignée'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                          <ImageIcon size={12} />
                          <span>{action.images?.length || 0}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditing(action)}
                            className="btn-secondary py-1.5 px-3 text-xs font-bold"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => del(action._id, action.title)}
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
      )}

      {/* Pagination Corporate */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-bold text-slate-600 shadow-sm">
        <div>
          Affichage de <span className="text-slate-900">{filtered.length > 0 ? (page - 1) * perPage + 1 : 0}</span> à{' '}
          <span className="text-slate-900">{Math.min(page * perPage, filtered.length)}</span> sur{' '}
          <span className="text-slate-900">{filtered.length}</span> action{filtered.length > 1 ? 's' : ''}
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
