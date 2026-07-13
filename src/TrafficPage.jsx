import React, { useEffect, useState } from 'react'
import api from './api'

export default function TrafficPage() {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/traffic/stats')
      .then(res => setStats(res.data))
      .catch(() => alert("Erreur lors du chargement des statistiques de trafic"))
      .finally(() => setLoading(false))
  }, [])

  const totalVisits = stats.reduce((acc, curr) => acc + (curr.visits || 0), 0)
  const totalAdminVisits = stats.reduce((acc, curr) => acc + (curr.adminVisits || 0), 0)
  const totalLogins = stats.reduce((acc, curr) => acc + (curr.logins || 0), 0)
  
  const today = new Date().toISOString().split('T')[0]
  const todayData = stats.find(s => s.date === today) || { visits: 0, adminVisits: 0, logins: 0 }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="stat-card">
          <div className="text-sm font-semibold text-slate-500">Visites Publiques (30j)</div>
          <div className="mt-2 text-3xl font-black text-slate-950">{loading ? '...' : totalVisits}</div>
        </div>
        <div className="stat-card">
          <div className="text-sm font-semibold text-slate-500">Activité Admin (30j)</div>
          <div className="mt-2 text-3xl font-black text-slate-950">{loading ? '...' : totalAdminVisits}</div>
        </div>
        <div className="stat-card">
          <div className="text-sm font-semibold text-slate-500">Connexions (Logins)</div>
          <div className="mt-2 text-3xl font-black text-slate-950">{loading ? '...' : totalLogins}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="font-bold text-slate-950">Statistiques du jour</h3>
        </div>
        <div className="p-6 grid gap-6 md:grid-cols-3">
           <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase">Visites aujourd'hui</span>
              <span className="text-2xl font-black text-primary">{todayData.visits}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase">Rafraîchissements Admin</span>
              <span className="text-2xl font-black text-slate-900">{todayData.adminVisits}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase">Authentifications</span>
              <span className="text-2xl font-black text-emerald-600">{todayData.logins}</span>
           </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="font-bold text-slate-950">Historique détaillé</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement des données...</div>
        ) : stats.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Aucune donnée de trafic pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Visites Publiques</th>
                  <th className="px-6 py-3">Activité Admin</th>
                  <th className="px-6 py-3">Logins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{s.visits || 0}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{s.adminVisits || 0}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">{s.logins || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
