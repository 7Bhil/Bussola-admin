import React, { useEffect, useState } from 'react'
import {
  User,
  Shield,
  KeyRound,
  Laptop,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
  Lock,
  Smartphone,
  Globe
} from 'lucide-react'
import api from './api'

// Helper pour formater proprement le User Agent (Appareil & Navigateur)
function parseUserAgent(ua) {
  if (!ua || typeof ua !== 'string') return { device: 'Inconnu', browser: 'Navigateur inconnu', os: 'Système inconnu' }

  let os = 'Appareil inconnu'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Linux')) os = 'Linux'

  let browser = 'Navigateur'
  if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/([\d.]+)/)
    browser = `Firefox ${match ? match[1].split('.')[0] : ''}`
  } else if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/([\d.]+)/)
    browser = `Edge ${match ? match[1].split('.')[0] : ''}`
  } else if (ua.includes('Chrome/')) {
    const match = ua.match(/Chrome\/([\d.]+)/)
    browser = `Chrome ${match ? match[1].split('.')[0] : ''}`
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    const match = ua.match(/Version\/([\d.]+)/)
    browser = `Safari ${match ? match[1].split('.')[0] : ''}`
  }

  const isMobile = ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')

  return {
    device: os,
    browser,
    isMobile,
    raw: ua
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [status, setStatus] = useState({ type: null, message: '' })
  const [updating, setUpdating] = useState(false)
  const [previousLogin, setPreviousLogin] = useState({ lastLoginAt: null, lastDevice: null })
  const [showRawUA, setShowRawUA] = useState(false)

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setUser(res.data)
        
        // Charger les détails de connexion précédente
        const storedPreviousLogin = localStorage.getItem('previousLogin')
        if (storedPreviousLogin) {
          try {
            setPreviousLogin(JSON.parse(storedPreviousLogin))
          } catch (e) {
            console.error(e)
          }
        }
      })
      .catch((err) => {
        console.error('Erreur profil:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (!passwords.currentPassword) {
      return setStatus({ type: 'error', message: 'Veuillez saisir votre mot de passe actuel.' })
    }

    if (passwords.newPassword.length < 6) {
      return setStatus({ type: 'error', message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' })
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setStatus({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas.' })
    }

    setUpdating(true)
    setStatus({ type: null, message: '' })

    try {
      const res = await api.put('/auth/update', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      setStatus({ type: 'success', message: res.data?.message || 'Mot de passe mis à jour avec succès.' })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe.'
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#2764ae] rounded-full animate-spin" />
        <span className="text-sm font-semibold">Chargement du profil administrateur...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center font-medium">
        Impossible de charger les informations de votre profil. Veuillez vous reconnecter.
      </div>
    )
  }

  const currentUA = parseUserAgent(user.lastDevice)
  const prevUA = parseUserAgent(previousLogin.lastDevice)

  return (
    <div className="page-shell max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2764ae] text-white flex items-center justify-center font-extrabold text-xl shadow-sm">
            {(user.username || 'A').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{user.username}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2764ae] uppercase tracking-wide">
                {user.role || 'Administrateur'}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Gestion de votre compte et contrôle de la sécurité
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Compte Sécurisé & Actif</span>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Column: Personal info & Security Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Information Compte */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="text-[#2764ae]" size={18} />
              <h2 className="font-bold text-slate-900 text-base">Informations Administrateur</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Nom d'utilisateur
                </span>
                <span className="font-semibold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 block">
                  {user.username}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Rôle Système
                </span>
                <span className="font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 block">
                  {user.role === 'admin' ? 'Administrateur Général' : user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Sécurité & Appareils Connectés */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="text-[#2764ae]" size={18} />
              <h2 className="font-bold text-slate-900 text-base">Sécurité & Appareils</h2>
            </div>

            {/* Session Actuelle */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-[#2764ae]">
                  <Clock size={14} /> Session Actuelle
                </span>
                <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">En cours</span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                  {currentUA.isMobile ? <Smartphone size={18} /> : <Laptop size={18} />}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{currentUA.browser} ({currentUA.device})</div>
                  <div className="text-xs text-slate-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : 'Maintenant'}
                  </div>
                </div>
              </div>
            </div>

            {/* Connexion Précédente */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} /> Connexion Précédente
              </div>

              {previousLogin.lastLoginAt ? (
                <div className="flex items-center gap-3 pt-1">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                    {prevUA.isMobile ? <Smartphone size={18} /> : <Laptop size={18} />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">{prevUA.browser} ({prevUA.device})</div>
                    <div className="text-xs text-slate-500">
                      {new Date(previousLogin.lastLoginAt).toLocaleString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-medium text-slate-500 pt-1">
                  Aucune connexion antérieure enregistrée dans cette session.
                </div>
              )}
            </div>

            {/* Bouton Détails Techniques User-Agent */}
            <div>
              <button
                type="button"
                onClick={() => setShowRawUA(!showRawUA)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
              >
                <Globe size={13} />
                <span>{showRawUA ? 'Masquer la signature navigateur' : 'Voir la signature navigateur complète'}</span>
              </button>

              {showRawUA && (
                <div className="mt-2 text-[11px] font-mono text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200 break-all leading-relaxed">
                  {user.lastDevice || 'Non disponible'}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Change Password Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <KeyRound className="text-[#2764ae]" size={20} />
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Changer de mot de passe</h2>
                <p className="text-xs text-slate-500">Mettez à jour votre mot de passe pour sécuriser votre accès</p>
              </div>
            </div>

            {/* Success or Error Status Alert */}
            {status.message && (
              <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 border ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />
                ) : (
                  <AlertCircle className="shrink-0 text-rose-600" size={20} />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              
              {/* Mot de passe actuel */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    required
                    value={passwords.currentPassword}
                    onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2764ae] focus:ring-4 focus:ring-[#2764ae]/10 transition"
                    placeholder="Saisissez votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwords.newPassword}
                    onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2764ae] focus:ring-4 focus:ring-[#2764ae]/10 transition"
                    placeholder="Au moins 6 caractères"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirmer le nouveau mot de passe */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    required
                    value={passwords.confirmPassword}
                    onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2764ae] focus:ring-4 focus:ring-[#2764ae]/10 transition"
                    placeholder="Répétez le nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button - HIGH CONTRAST SOLID BLUE */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2764ae] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1f5291] focus:outline-none focus:ring-4 focus:ring-[#2764ae]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {updating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mise à jour en cours...</span>
                    </div>
                  ) : (
                    <span>Mettre à jour le mot de passe</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
