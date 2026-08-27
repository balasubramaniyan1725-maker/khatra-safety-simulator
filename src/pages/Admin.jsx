import { useState } from 'react'
import { getCertificates } from '../lib/certificate.js'
import { CERTIFICATION_DOMAINS } from '../lib/scenarios.js'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Admin() {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const certificates = getCertificates()

  const filtered = certificates.filter((c) => c.workerName.toLowerCase().includes(search.toLowerCase()))

  const avgCompliance = certificates.length
    ? Math.round(certificates.reduce((s, c) => s + c.avgScore, 0) / certificates.length)
    : 0

  const domainAverages = CERTIFICATION_DOMAINS.map((domain) => {
    const scores = certificates
      .map((c) => c.domains.find((d) => d.domain === domain)?.score)
      .filter((s) => s !== undefined)
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
    return { domain, avg, count: scores.length }
  })

  const exportCsv = () => {
    const header = ['Worker Name', 'Certificate ID', 'Issued Date', 'Average Score', ...CERTIFICATION_DOMAINS]
    const rows = certificates.map((c) => [
      c.workerName,
      c.id,
      new Date(c.issuedAt).toLocaleDateString(),
      c.avgScore,
      ...CERTIFICATION_DOMAINS.map((domain) => c.domains.find((d) => d.domain === domain)?.score ?? ''),
    ])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'khatra_compliance_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <p className="font-mono text-amber text-xs tracking-[0.2em] uppercase mb-3">{t('admin_eyebrow')}</p>
      <h1 className="font-display font-bold text-4xl md:text-5xl uppercase mb-3">{t('admin_title')}</h1>

      <div className="bg-hazard/10 border border-hazard/40 rounded p-3 mb-8 text-xs text-concrete">
        {t('admin_demo_notice')}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatBlock label={t('admin_total_certs')} value={certificates.length} />
        <StatBlock label={t('admin_avg_compliance')} value={`${avgCompliance}%`} accent />
        <StatBlock label={t('admin_domains')} value={CERTIFICATION_DOMAINS.length} />
        <StatBlock label={t('admin_pass_rate')} value={certificates.length ? '100%' : '—'} />
      </div>

      {/* Domain breakdown */}
      <h2 className="font-display font-bold text-2xl uppercase mb-4">{t('admin_domain_breakdown')}</h2>
      <div className="space-y-2 mb-10">
        {domainAverages.map((d) => (
          <div key={d.domain} className="bg-steel-light border border-steel-lighter rounded p-3 flex items-center justify-between">
            <span className="text-sm font-bold">{d.domain}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-concrete font-mono">
                {d.count} {t('admin_records')}
              </span>
              <span className="font-mono text-amber font-bold text-sm">{d.avg !== null ? `${d.avg}%` : '—'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Worker table */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-display font-bold text-2xl uppercase">{t('admin_certified_workers')}</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin_search')}
            className="bg-steel-light border border-steel-lighter rounded px-3 py-2 text-sm font-mono focus:border-amber outline-none"
          />
          <button
            onClick={exportCsv}
            disabled={certificates.length === 0}
            className="bg-amber text-steel font-bold text-xs uppercase px-4 py-2 rounded disabled:opacity-40"
          >
            {t('admin_export_csv')}
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-concrete font-mono text-sm border border-steel-lighter rounded-lg p-8 text-center">
          {t('admin_no_certs')}
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((c) => (
          <div key={c.id} className="bg-steel-light border border-steel-lighter rounded p-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-bold text-sm">{c.workerName}</p>
              <p className="font-mono text-[10px] text-concrete">{c.id} · {new Date(c.issuedAt).toLocaleDateString()}</p>
            </div>
            <span className="font-mono text-amber font-bold">{c.avgScore}%</span>
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
