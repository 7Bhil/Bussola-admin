import React, { useEffect, useState } from 'react'
import api from './api'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [status, setStatus] = useState({ type: null, message: '' })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setStatus({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas' })
    }
    
    setUpdating(true)
    setStatus({ type: null, message: '' })
    
    try {
      await api.put('/auth/update', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      setStatus({ type: 'success', message: 'Mot de passe mis à jour avec succès' })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la mise à jour' })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement de votre profil...</div>
  if (!user) return <div className="p-8 text-center text-red-600">Erreur lors de la récupération du profil.</div>

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <div className="eyebrow">Mon compte</div>
          <h2 className="page-title">Profil Administrateur</h2>
          <p className="page-subtitle">Gère tes informations personnelles et surveille la sécurité de ton compte.</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-950 mb-4">Informations personnelles</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nom d'utilisateur</label>
                <div className="mt-1 text-lg font-bold text-slate-900">{user.username}</div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rôle</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="badge bg-emerald-100 text-emerald-800">{user.role}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-950 mb-4">Sécurité & Connexion</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dernière connexion</label>
                <div className="mt-1 text-slate-900 font-medium">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : 'Première connexion'}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Appareil utilisé</label>
                <div className="mt-1 text-sm text-slate-600 font-mono bg-slate-50 p-3 rounded-xl border border-slate-100 break-words">
                  {user.lastDevice || 'Non renseigné'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-950 mb-4">Changer le mot de passe</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {status.message && (
              <div className={`p-3 rounded-xl text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {status.message}
              </div>
            )}
            
            <div>
              <label className="field-label">Mot de passe actuel</label>
              <input 
                type="password" 
                required 
                className="input-field"
                value={passwords.currentPassword}
                onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
              />
            </div>
            
            <div>
              <label className="field-label">Nouveau mot de passe</label>
              <input 
                type="password" 
                required 
                className="input-field"
                value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
              />
            </div>
            
            <div>
              <label className="field-label">Confirmer le nouveau mot de passe</label>
              <input 
                type="password" 
                required 
                className="input-field"
                value={passwords.confirmPassword}
                onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={updating}
              className="btn-primary w-full"
            >
              {updating ? 'Mise à jour...' : 'Enregistrer le nouveau mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
