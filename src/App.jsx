import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from './api'

export default function App() {
  const username = localStorage.getItem('username') || 'Administrateur'
  const [data, setData] = useState({ news: [], actions: [], messages: [], subscribers: [], traffic: [], testimonials: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/news'),
      api.get('/actions'),
      api.get('/messages'),
      api.get('/subscribers'),
      api.get('/traffic/stats'),
      api.get('/testimonials/admin'),
    ]).then(results => {
      setData({
        news: results[0].status === 'fulfilled' ? results[0].value.data : [],
        actions: results[1].status === 'fulfilled' ? results[1].value.data : [],
        messages: results[2].status === 'fulfilled' ? results[2].value.data : [],
        subscribers: results[3].status === 'fulfilled' ? results[3].value.data : [],
        traffic: results[4].status === 'fulfilled' ? results[4].value.data : [],
        testimonials: results[5].status === 'fulfilled' ? results[5].value.data : [],
      })
    }).finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ([
    { label: 'Visites', value: data.traffic.reduce((acc, curr) => acc + curr.visits, 0), to: '/traffic', detail: 'Visites totales (30j)' },
    { label: 'Actualités', value: data.news.length, to: '/news', detail: 'Articles publiés' },
    { label: 'Témoignages', value: data.testimonials.length, to: '/testimonials', detail: "Retours d'impact" },
    { label: 'Messages', value: data.messages.length, to: '/messages', detail: 'Demandes reçues' },
    { label: 'Abonnés', value: data.subscribers.length, to: '/subscribers', detail: 'Newsletter' },
  ]), [data])

  const recentMessages = [...data.messages].slice(0, 4)
  const recentActions = [...data.actions].slice(0, 4)

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <div className="eyebrow">Vue générale</div>
          <h2 className="page-title">Bienvenue, {username}</h2>
          <p className="page-subtitle">Pilote les contenus du site Busola, suis les messages entrants et vérifie rapidement l’activité récente.</p>
        </div>
        <div className="toolbar">
          <Link to="/news" className="btn-secondary">Gérer les actualités</Link>
          <Link to="/actions" className="btn-primary">Créer une action</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.to} className="stat-card">
            <div className="text-sm font-semibold text-slate-500">{stat.label}</div>
            <div className="mt-3 text-4xl font-black tracking-tight text-slate-950">{loading ? '...' : stat.value}</div>
            <div className="mt-2 text-sm text-slate-500">{stat.detail}</div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Messages récents</h3>
              <p className="text-sm text-slate-500">Derniers contacts envoyés depuis le site.</p>
            </div>
            <Link to="/messages" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">Tout voir</Link>
          </div>
          {recentMessages.length === 0 ? (
            <div className="empty-state py-8">Aucun message à afficher.</div>
          ) : (
            <div className="space-y-3">
              {recentMessages.map(message => (
                <div key={message._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{message.name}</div>
                      <div className="text-sm text-slate-500">{message.email}</div>
                    </div>
                    <span className="badge bg-emerald-100 text-emerald-800">Message</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{message.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Actions récentes</h3>
              <p className="text-sm text-slate-500">Aperçu des projets enregistrés.</p>
            </div>
            <Link to="/actions" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">Tout voir</Link>
          </div>
          {recentActions.length === 0 ? (
            <div className="empty-state py-8">Aucune action enregistrée.</div>
          ) : (
            <div className="space-y-3">
              {recentActions.map(action => (
                <div key={action._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{action.title}</div>
                      <div className="text-sm text-slate-500">{action.location || 'Localisation non définie'}</div>
                    </div>
                    <span className="badge bg-blue-100 text-blue-800">{action.status || 'En cours'}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{action.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
