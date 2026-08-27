import { getLog, computeStats, clearLog } from '../lib/store.js'
import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Dashboard() {
  const { t } = useLanguage()
  const [, forceUpdate] = useState(0)
  const log = getLog()
  const stats = computeStats()

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <p className="font-mono text-amber text-xs tracking-[0.2em] uppercase mb-3">{t('dash_eyebrow')}</p>
      <h1 className="font-display font-bold text-4xl md:text-5xl uppercase mb-10">{t('dash_title')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatBlock label={t('dash_sessions')} value={stats.totalSessions} />
        <StatBlock label={t('dash_scans')} value={stats.scans} />
        <StatBlock label={t('dash_scenarios')} value={stats.scenarios} />
        <StatBlock label={t('dash_avg')} value={`${stats.avgScenarioScore}%`} accent />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-2xl uppercase">{t('dash_log')}</h2>
        {log.length > 0 && (
          <button
            onClick={() => {
              clearLog()
              forceUpdate((n) => n + 1)
            }}
            className="font-mono text-xs text-concrete hover:text-hazard underline"
          >
            {t('dash_clear')}
          </button>
        )}
      </div>

      {log.length === 0 && (
        <p className="text-concrete font-mono text-sm border border-steel-lighter rounded-lg p-8 text-center">
          {t('dash_empty')}
        </p>
      )}

      <div className="space-y-2">
        {log.map((entry, i) => (
          <div key={i} className="bg-steel-light border border-steel-lighter rounded p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm uppercase">
                {entry.type === 'scan' ? t('dash_hazard_scan') : t('dash_scenario_training')}
                {entry.scenarioId ? ` — ${entry.scenarioId}` : ''}
              </p>
              <p className="font-mono text-xs text-concrete">{new Date(entry.timestamp).toLocaleString()}</p>
            </div>
            <div className="text-right">
              {entry.type === 'scan' ? (
                <>
                  <p className="font-mono text-amber font-bold">{entry.riskScore}/100</p>
                  <p className="text-[10px] text-concrete font-mono">
                    {entry.hazardCount} {t('dash_hazards_word')}
                  </p>
                </>
              ) : (
                <p className="font-mono text-amber font-bold">{entry.score}%</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatBlock({ label, value, accent }) {
  return (
    <div className="bg-steel-light border border-steel-lighter rounded-lg p-5">
      <p className={`font-display font-bold text-4xl ${accent ? 'text-amber' : 'text-chalk'}`}>{value}</p>
      <p className="font-mono text-[10px] text-concrete uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}
