import React, { useEffect, useState, useMemo } from 'react'
import { Users, FileText, CalendarDays, KeyRound } from 'lucide-react'
import api from './api'

// ─── Graphique en barres SVG ─────────────────────────────────────────────────
function BarChart({ data, valueKey, color = '#2864ae', label = 'Visites' }) {
  const values = data.map(d => d[valueKey] || 0)
  const max = Math.max(...values, 1)
  const W = 600, H = 140, PAD = 8, BAR_GAP = 3

  const barWidth = (W - PAD * 2) / Math.max(data.length, 1) - BAR_GAP

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" style={{ minWidth: 320 }}>
        {/* Lignes de grille */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line
            key={ratio}
            x1={PAD} y1={PAD + (1 - ratio) * H}
            x2={W - PAD} y2={PAD + (1 - ratio) * H}
            stroke="#e2e8f0" strokeWidth="1"
          />
        ))}

        {/* Barres */}
        {data.map((d, i) => {
          const x = PAD + i * ((W - PAD * 2) / data.length)
          const barH = max > 0 ? ((d[valueKey] || 0) / max) * H : 0
          const y = PAD + H - barH
          const isToday = i === data.length - 1

          return (
            <g key={d.date || i}>
              <rect
                x={x + BAR_GAP / 2}
                y={y}
                width={Math.max(barWidth, 2)}
                height={barH}
                rx={3}
                fill={isToday ? color : `${color}99`}
              />
              {/* Valeur au-dessus si assez grande */}
              {barH > 16 && (
                <text
                  x={x + BAR_GAP / 2 + barWidth / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize={9}
                  fill={color}
                  fontWeight="700"
                >
                  {d[valueKey] || 0}
                </text>
              )}
            </g>
          )
        })}

        {/* Labels dates (1 sur 2 pour éviter le chevauchement) */}
        {data.map((d, i) => {
          if (data.length > 14 && i % 2 !== 0) return null
          const x = PAD + i * ((W - PAD * 2) / data.length) + BAR_GAP / 2 + barWidth / 2
          const shortDate = d.date ? d.date.slice(5) : '' // MM-DD
          return (
            <text key={`lbl-${i}`} x={x} y={H + PAD + 16} textAnchor="middle" fontSize={9} fill="#94a3b8">
              {shortDate}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Graphique linéaire SVG ───────────────────────────────────────────────────
function LineChart({ data, valueKey, color = '#10b981' }) {
  const values = data.map(d => d[valueKey] || 0)
  const max = Math.max(...values, 1)
  const W = 600, H = 120, PAD = 12

  const pts = data.map((d, i) => {
    const x = PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2)
    const y = PAD + (1 - (d[valueKey] || 0) / max) * (H - PAD)
    return [x, y]
  })

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const areaD = pts.length > 0
    ? `${pathD} L${pts[pts.length - 1][0].toFixed(1)},${(H + PAD).toFixed(1)} L${pts[0][0].toFixed(1)},${(H + PAD).toFixed(1)} Z`
    : ''

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" style={{ minWidth: 320 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Aire sous la courbe */}
        {areaD && <path d={areaD} fill="url(#lineGrad)" />}
        {/* Courbe */}
        {pathD && <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />}
        {/* Points */}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3} fill={color} />
        ))}
        {/* Labels dates */}
        {data.map((d, i) => {
          if (data.length > 14 && i % 3 !== 0) return null
          const x = PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2)
          return (
            <text key={`lbl-${i}`} x={x} y={H + PAD + 16} textAnchor="middle" fontSize={9} fill="#94a3b8">
              {d.date ? d.date.slice(5) : ''}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Carte KPI ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, trend, icon: Icon, iconColor = 'text-slate-400', color = 'text-slate-950' }) {
  const trendPositive = trend > 0
  const trendNeutral = trend === 0 || trend === null || trend === undefined

  return (
    <div className="stat-card flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{label}</span>
        {Icon && <Icon size={18} className={iconColor} strokeWidth={2} />}
      </div>
      <div className={`mt-1 text-3xl font-black tracking-tight ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
      {!trendNeutral && (
        <div className={`mt-1 flex items-center gap-1 text-xs font-semibold ${trendPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          <span>{trendPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% vs semaine préc.</span>
        </div>
      )}
    </div>
  )
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default function TrafficPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('visits') // 'visits' | 'pageviews'

  useEffect(() => {
    api.get('/traffic/summary')
      .then(res => setSummary(res.data))
      .catch(() => setError('Impossible de charger les données de trafic.'))
      .finally(() => setLoading(false))
  }, [])

  const daily = useMemo(() => summary?.daily || [], [summary])

  // Derniers 14 jours pour le graphique en barres
  const last14 = useMemo(() => {
    const all = [...daily]
    return all.slice(-14)
  }, [daily])

  if (loading) {
    return (
      <div className="page-shell">
        <section className="page-header">
          <div>
            <div className="eyebrow">Analytics</div>
            <h2 className="page-title">Trafic du site</h2>
            <p className="page-subtitle">Chargement des données...</p>
          </div>
        </section>
        <div className="flex items-center justify-center py-24">
          <div className="text-slate-400 animate-pulse text-lg">Chargement des statistiques…</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell">
        <section className="page-header">
          <div>
            <div className="eyebrow">Analytics</div>
            <h2 className="page-title">Trafic du site</h2>
          </div>
        </section>
        <div className="empty-state py-16 text-red-500">{error}</div>
      </div>
    )
  }

  const s = summary || {}

  return (
    <div className="page-shell">
      {/* En-tête */}
      <section className="page-header">
        <div>
          <div className="eyebrow">Analytics</div>
          <h2 className="page-title">Trafic du site</h2>
          <p className="page-subtitle">
            Visites, pages vues et connexions au cours des 30 derniers jours.
          </p>
        </div>
        <div className="toolbar">
          <span className="badge bg-emerald-100 text-emerald-700 text-xs px-3 py-1.5">
            ● Données en temps réel
          </span>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Visites (30j)"
          value={s.totalVisits30d ?? '—'}
          sub="Sessions uniques"
          trend={s.visitsTrend}
          icon={Users}
          iconColor="text-blue-500"
          color="text-blue-700"
        />
        <KpiCard
          label="Pages vues (30j)"
          value={s.totalPageViews30d ?? '—'}
          sub="Navigations totales"
          trend={s.viewsTrend}
          icon={FileText}
          iconColor="text-emerald-500"
          color="text-emerald-700"
        />
        <KpiCard
          label="Aujourd'hui"
          value={s.todayVisits ?? '—'}
          sub={`${s.todayPageViews ?? 0} pages vues`}
          icon={CalendarDays}
          iconColor="text-slate-400"
          color="text-slate-900"
        />
        <KpiCard
          label="Connexions Admin (30j)"
          value={s.totalLogins30d ?? '—'}
          sub="Authentifications réussies"
          icon={KeyRound}
          iconColor="text-amber-500"
          color="text-amber-600"
        />
      </section>

      {/* Graphique barres — 14 derniers jours */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <h3 className="font-bold text-slate-950">Évolution — 14 derniers jours</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setView('visits')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === 'visits' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Visites
            </button>
            <button
              onClick={() => setView('pageviews')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === 'pageviews' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Pages vues
            </button>
          </div>
        </div>
        <div className="p-6">
          {last14.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Aucune donnée disponible — le tracking démarrera dès les premières visites.
            </div>
          ) : (
            <BarChart
              data={last14}
              valueKey={view === 'visits' ? 'visits' : 'pageViews'}
              color={view === 'visits' ? '#2864ae' : '#10b981'}
            />
          )}
        </div>
      </div>

      {/* Graphique linéaire — 30j */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="font-bold text-slate-950">Courbe des pages vues — 30 jours</h3>
        </div>
        <div className="p-6">
          {daily.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucune donnée disponible.</div>
          ) : (
            <LineChart data={daily} valueKey="pageViews" color="#10b981" />
          )}
        </div>
      </div>

      {/* Comparaison semaine */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Cette semaine</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-blue-700">{s.thisWeekVisits ?? 0}</div>
              <div className="text-sm text-slate-500 mt-1">visites</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-700">{s.thisWeekViews ?? 0}</div>
              <div className="text-sm text-slate-500 mt-1">pages vues</div>
            </div>
          </div>
        </div>
        <div className="card p-6 bg-slate-50/50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Semaine précédente</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-slate-500">{s.lastWeekVisits ?? 0}</div>
              <div className="text-sm text-slate-400 mt-1">visites</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-slate-500">{s.lastWeekViews ?? 0}</div>
              <div className="text-sm text-slate-400 mt-1">pages vues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau historique */}
      <div className="table-wrap">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="font-bold text-slate-950">Historique détaillé — 30 derniers jours</h3>
        </div>
        {daily.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Aucune donnée de trafic pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="table-head">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Visites</th>
                  <th className="px-6 py-3 text-right">Pages vues</th>
                  <th className="px-6 py-3 text-right">Logins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...daily].reverse().map(s => (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition">
                    <td className="table-cell text-sm font-medium text-slate-700">
                      {s.date
                        ? new Date(s.date + 'T12:00:00').toLocaleDateString('fr-FR', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                          })
                        : '—'}
                    </td>
                    <td className="table-cell text-right">
                      <span className="text-sm font-bold text-blue-700">{s.visits || 0}</span>
                    </td>
                    <td className="table-cell text-right">
                      <span className="text-sm font-bold text-emerald-700">{s.pageViews || 0}</span>
                    </td>
                    <td className="table-cell text-right">
                      <span className="text-sm font-bold text-amber-600">{s.logins || 0}</span>
                    </td>
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
