import React, { useEffect, useState } from 'react'
import api from './api'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/auth'),
      api.get('/auth/me')
    ]).then(([usersRes, meRes]) => {
      setUsers(usersRes.data)
      setCurrentUser(meRes.data)
    })
    .catch(() => alert("Erreur lors du chargement des données"))
    .finally(() => setLoading(false))
  }, [])

  const deleteUser = async (id) => {
    if (!window.confirm("Supprimer cet administrateur ? Cette action est irréversible.")) return
    try {
      await api.delete(`/auth/${id}`)
      setUsers(users.filter(u => u._id !== id))
    } catch (e) {
      alert(e.response?.data?.message || "Erreur lors de la suppression")
    }
  }

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <div className="eyebrow">Gestion d'accès</div>
          <h2 className="page-title">Utilisateurs Administrateurs</h2>
          <p className="page-subtitle">Liste des personnes ayant accès à l'interface d'administration du site.</p>
        </div>
      </section>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Chargement des utilisateurs...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Utilisateur</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Rôle</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Dernière Connexion</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">Aucun utilisateur trouvé.</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{user.username} {currentUser?.id === user._id && <span className="text-xs font-normal text-slate-400 ml-1">(Vous)</span>}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge bg-emerald-100 text-emerald-800">
                          {user.role || 'admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        }) : 'Jamais'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {currentUser?.id !== user._id && (
                          <button onClick={() => deleteUser(user._id)} className="btn-danger py-1 px-3 text-xs">
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
