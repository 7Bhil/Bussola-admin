import React, { useEffect, useState } from 'react'
import api from './api'
import ProjectForm from './ProjectForm'

export default function ProjectPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/projects').then(res => setItems(res.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!window.confirm('Supprimer ce projet ? Cela ne supprimera pas les actions associées mais elles ne seront plus liées.')) return
    try {
      await api.delete(`/projects/${id}`)
      setItems(items.filter(i => i._id !== id))
    } catch (e) {
      alert('Suppression impossible')
    }
  }

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <div className="eyebrow">Organisation</div>
          <h2 className="page-title">Projets (Piliers)</h2>
          <p className="page-subtitle">Gère les grandes catégories de l'ONG qui regroupent vos différentes actions terrain.</p>
        </div>
        <div className="toolbar">
          <button onClick={() => setEditing({})} className="btn-primary">Nouveau projet</button>
        </div>
      </section>

      {editing && (
        <ProjectForm initial={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Chargement des projets...</div>
        ) : items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">Aucun projet créé. Commencez par en ajouter un !</div>
        ) : items.map(i => (
          <div key={i._id} className="card overflow-hidden group">
            <div className="relative h-40 w-full overflow-hidden">
              <img src={i.coverImage} alt={i.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-lg font-bold text-white leading-tight">{i.title}</h3>
              </div>
              <div className="absolute top-3 right-3 h-4 w-4 rounded-full shadow-inner" style={{ backgroundColor: i.color }}></div>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">{i.description}</p>
              <div className="flex gap-2">
                <button onClick={() => setEditing(i)} className="btn-secondary flex-1 py-2 text-sm">Éditer</button>
                <button onClick={() => del(i._id)} className="btn-danger aspect-square flex items-center justify-center p-0 w-9">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
