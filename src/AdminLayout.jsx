import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  Newspaper,
  FolderKanban,
  Activity,
  Quote,
  Mail,
  Users,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'

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

  const navCategories = [
    {
      title: 'Aperçu',
      items: [
        { path: '/', label: 'Dashboard', hint: 'Vue générale', icon: LayoutDashboard },
        { path: '/traffic', label: 'Trafic', hint: 'Analytics du site', icon: BarChart3 },
      ]
    },
    {
      title: 'Contenus & Projets',
      items: [
        { path: '/news', label: 'Actualités', hint: 'Articles et annonces', icon: Newspaper },
        { path: '/projects', label: 'Projets', hint: 'Piliers de l\'ONG', icon: FolderKanban },
        { path: '/actions', label: 'Actions', hint: 'Programmes terrain', icon: Activity },
        { path: '/testimonials', label: 'Témoignages', hint: "Retours d'impact", icon: Quote },
      ]
    },
    {
      title: 'Communauté',
      items: [
        { path: '/messages', label: 'Messages', hint: 'Contact public', icon: Mail },
        { path: '/subscribers', label: 'Abonnés', hint: 'Newsletter', icon: Users },
      ]
    },
    {
      title: 'Système',
      items: [
        { path: '/users', label: 'Utilisateurs', hint: 'Gestion d\'accès', icon: ShieldCheck },
        { path: '/profile', label: 'Mon Profil', hint: 'Sécurité et compte', icon: UserCheck },
      ]
    }
  ]

  const allItems = navCategories.flatMap(c => c.items)
  const current = allItems.find(item => item.path === location.pathname) || allItems[0]

  const userInitials = username.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 lg:flex font-sans selection:bg-primary selection:text-white">
      {/* Mobile Drawer Overlay */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 shadow-xl shadow-slate-200/50 lg:shadow-none`}>
        
        {/* Brand Header */}
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 border border-slate-200/80 p-2 shadow-sm">
                <img src="/favicon-busola.svg" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Busola Admin
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-xs font-semibold text-slate-400">Gestion Officielle</div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="lg:hidden rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Categorized Nav Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
          {navCategories.map(cat => (
            <div key={cat.title} className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {cat.title}
              </div>
              {cat.items.map(item => {
                const active = location.pathname === item.path
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all duration-200 ${
                      active
                        ? 'bg-[#2764ae] text-white shadow-sm font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        size={18}
                        className={`transition-colors shrink-0 ${
                          active ? 'text-white' : 'text-slate-400 group-hover:text-primary'
                        }`}
                      />
                      <span className="truncate text-sm">{item.label}</span>
                    </div>

                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm shrink-0" />
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-800 text-white font-extrabold text-xs shadow-sm">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900">{username}</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Connecté</span>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Déconnexion"
                className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                aria-label="Déconnexion"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col">
        
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
            
            {/* Header Title & Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl border border-slate-200/80 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Administration</span>
                  <ChevronRight size={12} className="text-slate-300" />
                  <span className="text-primary">{current.label}</span>
                </div>
                <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                  {current.label}
                </h1>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200/60 text-xs font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>API Connectée</span>
              </div>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition"
              >
                <span>Voir le site</span>
                <ExternalLink size={14} className="text-slate-400" />
              </a>
            </div>

          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
