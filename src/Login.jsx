import React, { useEffect, useState } from 'react'
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
      // Stocker les données de connexion précédente
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <img src="/favicon-busola.svg" alt="ONG Busola" className="h-16 w-16" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black tracking-tight text-slate-900">
          Espace Administration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Connectez-vous pour gérer les contenus de l'ONG Busola
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-700">
                Nom d'utilisateur
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary transition"
                  placeholder="votre_nom"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                    {isLocked && (
                      <p className="mt-1 text-xs font-semibold text-red-700">Réessayez dans {lockLabel}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || isLocked}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-50"
              >
                {isLocked ? 'Accès temporairement bloqué' : loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Se connecter au tableau de bord'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ONG BUSOLA © {new Date().getFullYear()}</span>
              <a href="/" className="hover:text-primary transition font-semibold">Retour au site</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
