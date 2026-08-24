import React, { useEffect, useState } from 'react'
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, Globe } from 'lucide-react'
import api from './api'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [blockedUntil, setBlockedUntil] = useState(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  useEffect(() => {
    if (!blockedUntil) return undefined

    const updateRemainingTime = () => {
      const seconds = Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000))
      setRemainingSeconds(seconds)
      if (seconds === 0) setBlockedUntil(null)
    }

    updateRemainingTime()
    const intervalId = window.setInterval(updateRemainingTime, 1000)
    return () => window.clearInterval(intervalId)
  }, [blockedUntil])

  const isLocked = remainingSeconds > 0
  const lockLabel = Math.floor(remainingSeconds / 60) + 'm ' + (remainingSeconds % 60) + 's'

  async function handleSubmit(e) {
    e.preventDefault()
    if (isLocked) return

    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/auth/login', { username, password })
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token)
      }
      if (res.data?.previousLoginAt || res.data?.previousDevice) {
        localStorage.setItem('previousLogin', JSON.stringify({
          lastLoginAt: res.data.previousLoginAt,
          lastDevice: res.data.previousDevice
        }))
      }
      onLogin(res.data)
    } catch (err) {
      const retryAfter = err.response?.data?.retryAfter
      setError(err.response?.data?.message || "Identifiants invalides")
      if (retryAfter) {
        setBlockedUntil(Date.now() + retryAfter * 1000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#2764ae] selection:text-white">
      
      {/* Header Info */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-slate-800 rounded-2xl border border-slate-700 shadow-md mb-4">
          <img src="/favicon-busola.svg" alt="ONG Busola" className="h-12 w-12 object-contain" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/50 text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
          <ShieldCheck size={14} className="text-blue-400" /> Espace Sécurisé
        </div>

        <h1 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Busola <span className="text-[#2764ae]">Admin</span>
        </h1>
        <p className="mt-2 text-center text-sm font-medium text-slate-400 max-w-sm mx-auto">
          Gestion centralisée du site officiel de l'ONG Busola
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-950 py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-800 relative">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User size={18} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-[#2764ae] focus:ring-2 focus:ring-[#2764ae]/20 transition"
                  placeholder="admin_busola"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Mot de passe
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-11 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-[#2764ae] focus:ring-2 focus:ring-[#2764ae]/20 transition"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-rose-300 text-sm font-medium flex flex-col gap-1">
                <span>{error}</span>
                {isLocked && (
                  <span className="text-xs font-bold text-rose-400">Compte verrouillé. Réessayez dans {lockLabel}</span>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || isLocked}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm text-white bg-[#2764ae] hover:bg-[#1f5291] shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLocked ? (
                  'Accès verrouillé'
                ) : loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  <>
                    <span>Connexion au tableau de bord</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>ONG BUSOLA © {new Date().getFullYear()}</span>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold transition hover:underline"
            >
              <Globe size={14} />
              <span>Voir le site</span>
            </a>
          </div>
        </div>

        {/* Discrete Developer Credits */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Développement web :{' '}
          <a
            href="https://7bhil.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white font-medium transition underline-offset-2 hover:underline"
          >
            CHITOU Bhilal
          </a>
          {' '}&amp;{' '}
          <a
            href="https://portfolio-jolidon-v2.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white font-medium transition underline-offset-2 hover:underline"
          >
            HOUGUE Jolidon
          </a>
        </p>
      </div>
    </div>
  )
}
