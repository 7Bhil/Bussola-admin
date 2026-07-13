import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from './api'
import logo from './assets/logo-busola.png'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const username = localStorage.getItem('username') || 'Administrateur'
  const [open, setOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Dashboard', hint: 'Vue générale' },
    { path: '/news', label: 'Actualités', hint: 'Articles et annonces' },
    { path: '/projects', label: 'Projets', hint: 'Piliers de l\'ONG' },
    { path: '/actions', label: 'Actions', hint: 'Programmes terrain' },
    { path: '/testimonials', label: 'Témoignages', hint: "Retours d'impact" },
    { path: '/messages', label: 'Messages', hint: 'Contact public' },
    { path: '/subscribers', label: 'Abonnés', hint: 'Newsletter' },
    { path: '/users', label: 'Utilisateurs', hint: 'Gestion d\'accès' },
    { path: '/profile', label: 'Mon Profil', hint: 'Sécurité et compte' },
  ]

  const current = navItems.find(item => item.path === location.pathname) || navItems[0]

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900 lg:flex">
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition lg:sticky lg:top-0 lg:h-screen lg:translate-x-0`}>
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200">
              <img src="/favicon-busola.svg" alt="Logo" className="w-full h-full object-contain p-2" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-slate-950">Busola Admin</div>
              <div className="text-xs font-medium text-slate-500">Gestion du site officiel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`group block rounded-xl px-4 py-3 transition ${active ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{item.label}</span>
                  {active && <span className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className={`mt-0.5 text-xs ${active ? 'text-blue-50' : 'text-slate-400 group-hover:text-slate-500'}`}>{item.hint}</div>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Connecté</div>
            <div className="mt-1 truncate text-sm font-bold text-slate-900">{username}</div>
            <button onClick={logout} className="mt-4 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</div>
              <h1 className="truncate text-xl font-black tracking-tight text-slate-950">{current.label}</h1>
            </div>
            <div className="flex items-center gap-3">
              <a href="/" className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:inline-flex">
                Voir le site
              </a>
              <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm lg:hidden">
                Menu
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
