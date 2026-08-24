import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Newspaper,
  Quote,
  Mail,
  Users,
  FolderKanban,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  Activity,
  Clock,
  TrendingUp,
  MessageSquare,
  ShieldCheck
} from 'lucide-react'
import api from './api'

export default function App() {
  const username = localStorage.getItem('username') || 'Administrateur'
  const [data, setData] = useState({ news: [], actions: [], messages: [], subscribers: [], testimonials: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/news'),
      api.get('/actions'),
      api.get('/messages'),
      api.get('/subscribers'),
      api.get('/testimonials/admin'),
    ]).then(results => {
      setData({
        news: results[0].status === 'fulfilled' ? results[0].value.data : [],
        actions: results[1].status === 'fulfilled' ? results[1].value.data : [],
        messages: results[2].status === 'fulfilled' ? results[2].value.data : [],
        subscribers: results[3].status === 'fulfilled' ? results[3].value.data : [],
        testimonials: results[4].status === 'fulfilled' ? results[4].value.data : [],
      })
    }).finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ([
    {
      label: 'Actualités',
      value: data.news.length,
      to: '/news',
      detail: 'Articles publiés',
      icon: Newspaper,
      color: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-100'
    },
    {
      label: 'Témoignages',
      value: data.testimonials.length,
      to: '/testimonials',
      detail: "Retours d'impact",
      icon: Quote,
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 text-emerald-600',
      borderColor: 'border-emerald-100'
    },
    {
      label: 'Messages',
      value: data.messages.length,
      to: '/messages',
      detail: 'Demandes reçues',
      icon: Mail,
      color: 'from-purple-500 to-violet-600',
      bgLight: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-100'
    },
    {
      label: 'Abonnés',
      value: data.subscribers.length,
      to: '/subscribers',
      detail: 'Newsletter',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50 text-amber-600',
      borderColor: 'border-amber-100'
    },
    {
      label: 'Actions',
      value: data.actions.length,
      to: '/actions',
      detail: 'Programmes terrain',
      icon: Activity,
      color: 'from-rose-500 to-pink-600',
      bgLight: 'bg-rose-50 text-rose-600',
      borderColor: 'border-rose-100'
    },
  ]), [data])

  const recentMessages = [...data.messages].slice(0, 4)
  const recentActions = [...data.actions].slice(0, 4)

  const currentDateFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="page-shell">
      
      {/* Welcome Banner Card */}
      <section className="rounded-2xl bg-slate-900 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-700">
              <Calendar size={14} className="text-blue-400" />
              <span className="capitalize">{currentDateFormatted}</span>
            </div>
            
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Bienvenue, <span className="text-blue-400">{username}</span> 👋
            </h2>
            
            <p className="max-w-xl text-sm font-medium text-slate-400 leading-relaxed">
              Pilotez les contenus de l'ONG Busola, suivez les messages reçus et analysez l'activité de votre plateforme.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/news" className="btn-secondary text-xs sm:text-sm font-bold bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white">
              <Newspaper size={16} />
              <span>Gérer les news</span>
            </Link>

            <Link to="/actions" className="btn-primary text-xs sm:text-sm font-bold bg-[#2764ae] hover:bg-[#1f5291] text-white border-none">
              <PlusCircle size={16} />
              <span>Créer une action</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stat Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} to={stat.to} className="stat-card group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
                <div className={`p-2.5 rounded-xl ${stat.bgLight} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {loading ? (
                    <span className="animate-pulse text-slate-300">...</span>
                  ) : (
                    stat.value
                  )}
                </span>
                
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 group-hover:text-primary transition-colors">
                  <span>Voir</span>
                  <ArrowRight size={12} />
                </span>
              </div>

              <div className="mt-1 text-xs font-medium text-slate-400">
                {stat.detail}
              </div>
            </Link>
          )
        })}
      </section>

      {/* Dashboard Main Widgets */}
      <section className="grid gap-6 xl:grid-cols-2">
        
        {/* Messages Récents Widget */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Messages récents</h3>
                  <p className="text-xs text-slate-500">Demandes envoyées depuis le site public</p>
                </div>
              </div>
              
              <Link to="/messages" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-blue-800 transition">
                <span>Tout voir</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs font-medium text-slate-400 animate-pulse">Chargement des messages...</div>
            ) : recentMessages.length === 0 ? (
              <div className="empty-state py-10">Aucun message pour le moment.</div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map(msg => (
                  <div key={msg._id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:bg-slate-100/70 hover:border-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                          {(msg.name || 'M').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-bold text-sm text-slate-900">{msg.name}</div>
                          <div className="truncate text-xs text-slate-500">{msg.email}</div>
                        </div>
                      </div>
                      
                      <span className="badge bg-purple-100 text-purple-800 shrink-0">
                        Nouveau
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600 font-medium">
                      "{msg.message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions Récents Widget */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Actions récentes</h3>
                  <p className="text-xs text-slate-500">Programmes et interventions enregistrés</p>
                </div>
              </div>

              <Link to="/actions" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-blue-800 transition">
                <span>Tout voir</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs font-medium text-slate-400 animate-pulse">Chargement des actions...</div>
            ) : recentActions.length === 0 ? (
              <div className="empty-state py-10">Aucune action enregistrée.</div>
            ) : (
              <div className="space-y-3">
                {recentActions.map(action => (
                  <div key={action._id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:bg-slate-100/70 hover:border-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-bold text-sm text-slate-900">{action.title}</div>
                        <div className="truncate text-xs text-slate-500">{action.location || 'Localisation non renseignée'}</div>
                      </div>
                      
                      <span className="badge bg-blue-100 text-blue-800 shrink-0">
                        {action.status || 'En cours'}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600 font-medium">
                      {action.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
  )
}
