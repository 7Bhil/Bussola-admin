import React, { useEffect, useState } from 'react'
import {
  FolderKanban,
  Plus,
  Edit3,
  Trash2,
  Layers,
  Palette,
  ArrowUpDown,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import api from './api'
import ProjectForm from './ProjectForm'

const LEGACY_TITLES = new Set(['pageda', 'yes', 'tedidjo'])
const isLegacy = (p) => LEGACY_TITLES.has(p.title.trim().toLowerCase())

export default function ProjectPage() {
  const [items, setItems] = useState([])
  const [actions, setActions] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [projRes, actRes] = await Promise.all([
        api.get('/projects'),
        api.get('/actions/admin').catch(() => ({ data: [] }))
      ])

      const filtered = projRes.data
        .filter(p => !isLegacy(p))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title))

      setItems(filtered)
      setActions(actRes.data || [])
    } catch (e) {
      console.error('Erreur chargement projets:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const del = async (id, title) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le projet "${title}" ? Les actions rattachées ne seront pas supprimées.`)) return
    try {
      await api.delete(`/projects/${id}`)
      setItems(items.filter(i => i._id !== id))
    } catch (e) {
      alert('Suppression impossible. Vérifiez vos permissions.')
    }
  }

  const filteredItems = items.filter(i =>
    `${i.title || ''} ${i.description || ''} ${i.pillar || ''}`.toLowerCase().includes(query.toLowerCase())
  )

  // Compter le nombre d'actions par projet
  const getActionCount = (proj) => {
    return actions.filter(a => {
      if (!a.project) return false
      const pId = typeof a.project === 'object' ? a.project._id : a.project
      return pId === proj._id || (proj.pillar && pId === proj.pillar)
    }).length
  }

  if (editing) {
    return (
      <div className="page-shell">
        <ProjectForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      </div>
    )
  }

  return (
    <div className="page-shell">
      {/* En-tête de page Corporate */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2764ae]">
            <FolderKanban size={16} />
            <span>Gestion de la Galerie & Piliers</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Projets d'intervention</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Organisez les grands piliers d'action de l'ONG Busola qui regroupent vos interventions terrain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input-field pl-9 py-2 text-sm w-full sm:w-60 bg-white border-slate-200 rounded-xl"
            />
          </div>
          
          <button
            onClick={() => setEditing({})}
            className="btn-primary inline-flex items-center gap-2 bg-[#2764ae] hover:bg-[#1f5291] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition"
          >
            <Plus size={18} />
            <span>Nouveau projet</span>
          </button>
        </div>
      </section>



      {/* Grille des Projets */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-sm font-semibold text-slate-400 animate-pulse">
            Chargement des projets...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8">
            <FolderKanban size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">Aucun projet trouvé</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Aucun projet ne correspond à votre recherche ou la liste est vide.
            </p>
            <button
              onClick={() => setEditing({})}
              className="mt-4 btn-primary inline-flex items-center gap-2 bg-[#2764ae] text-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              <Plus size={16} />
              <span>Créer un projet</span>
            </button>
          </div>
        ) : (
          filteredItems.map(item => {
            const count = getActionCount(item)
            return (
              <div
                key={item._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300"
              >
                <div>
                  {/* Bannière / Image de couverture */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={item.coverImage || '/optimized/project-1.webp'}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                      onError={(e) => { e.currentTarget.src = '/optimized/project-1.webp' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Pastille Couleur + Badge Actions */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/20">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color || '#2764ae' }} />
                        <span>Ordre #{item.order ?? 0}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 text-white px-3 py-1 text-xs font-bold shadow-sm">
                        <Layers size={13} />
                        <span>{count} action{count > 1 ? 's' : ''}</span>
                      </span>
                    </div>

                    {/* Titre sur l'image */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg font-extrabold text-white leading-snug drop-shadow-md">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Corps de la carte */}
                  <div className="p-5">
                    <p className="text-xs font-medium leading-relaxed text-slate-600 line-clamp-3">
                      {item.description || 'Aucune description disponible pour ce projet.'}
                    </p>
                  </div>
                </div>

                {/* Pied de carte avec actions */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Palette size={13} className="text-slate-400" />
                    <span className="font-mono">{item.color || '#2764ae'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <Edit3 size={14} className="text-slate-500" />
                      <span>Éditer</span>
                    </button>

                    <button
                      onClick={() => del(item._id, item.title)}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 transition"
                      title="Supprimer le projet"
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
    </div>
  )
}
