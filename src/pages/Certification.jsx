import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { getLog } from '../lib/store.js'
import { SCENARIOS } from '../lib/scenarios.js'
import {
  computeDomainProgress,
  overallCompliance,
  isEligibleForCertificate,
  issueCertificate,
  getCertificates,
  getWorkerProfile,
  setWorkerProfile,
  PASS_THRESHOLD,
} from '../lib/certificate.js'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Certification() {
  const { t } = useLanguage()
  const [, forceUpdate] = useState(0)
  const [name, setName] = useState(getWorkerProfile().name || '')

  const log = getLog()
  const domainProgress = computeDomainProgress(log, SCENARIOS)
  const compliance = overallCompliance(domainProgress)
  const eligible = isEligibleForCertificate(domainProgress)
  const certificates = getCertificates()
  const latestCert = certificates[0] || null

  const handleIssue = () => {
    setWorkerProfile({ name: name.trim() || 'Unnamed Worker' })
    issueCertificate(domainProgress, name.trim() || 'Unnamed Worker')
    forceUpdate((n) => n + 1)
  }

  const verifyUrl = latestCert ? `${window.location.origin}${window.location.pathname}#/verify/${latestCert.id}` : ''

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <p className="font-mono text-amber text-xs tracking-[0.2em] uppercase mb-3">{t('cert_eyebrow')}</p>
      <h1 className="font-display font-bold text-4xl md:text-5xl uppercase mb-2">{t('cert_title')}</h1>
      <p className="text-concrete mb-8 max-w-xl">{t('cert_desc')}</p>

      {/* Compliance summary */}
      <div className="bg-steel-light border border-steel-lighter rounded-lg p-6 mb-8 flex items-center gap-6 flex-wrap">
        <div className="text-center">
          <div className="font-display font-bold text-5xl text-amber">{compliance.passedCount}/{compliance.totalDomains}</div>
          <div className="font-mono text-[10px] text-concrete uppercase tracking-widest mt-1">{t('cert_domains_passed')}</div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="h-3 bg-steel rounded-full overflow-hidden">
            <div className="h-full bg-amber transition-all" style={{ width: `${compliance.percent}%` }} />
          </div>
          <p className="text-xs text-concrete font-mono mt-2">
            {t('cert_pass_threshold')} {PASS_THRESHOLD}%
          </p>
        </div>
      </div>

      {/* Domain checklist */}
      <div className="space-y-3 mb-10">
        {Object.values(domainProgress).map((d) => (
          <div
            key={d.domain}
            className="bg-steel-light border border-steel-lighter rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  d.passed ? 'bg-safe text-white' : 'bg-steel-lighter text-concrete'
                }`}
              >
                {d.passed ? '✓' : ''}
              </span>
              <span className="font-bold text-sm">{d.domain}</span>
            </div>
            <div className="text-right">
              <span className={`font-mono text-sm font-bold ${d.passed ? 'text-safe' : 'text-concrete'}`}>
                {d.bestScore}%
              </span>
              {!d.passed && d.attempts > 0 && (
                <p className="text-[10px] text-hazard font-mono">{t('cert_retry_needed')}</p>
              )}
              {d.attempts === 0 && <p className="text-[10px] text-concrete font-mono">{t('cert_not_attempted')}</p>}
            </div>
          </div>
        ))}
      </div>

      {!eligible && (
        <div className="border border-steel-lighter rounded-lg p-6 text-center text-concrete text-sm mb-6">
          {t('cert_not_eligible')} <Link to="/train" className="text-amber underline">{t('nav_train')}</Link>
        </div>
      )}

      {eligible && !latestCert && (
        <div className="bg-steel-light border border-amber rounded-lg p-6">
          <p className="font-bold text-lg mb-3">{t('cert_eligible_title')}</p>
          <label className="font-mono text-xs uppercase tracking-widest text-concrete block mb-2">{t('cert_name_label')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('cert_name_placeholder')}
            className="w-full bg-steel border border-steel-lighter rounded px-4 py-3 font-mono text-sm mb-4 focus:border-amber outline-none"
          />
          <button
            onClick={handleIssue}
            className="w-full bg-amber text-steel font-display font-bold text-lg uppercase py-3 rounded"
          >
            {t('cert_issue_btn')}
          </button>
        </div>
      )}

      {latestCert && (
        <div className="bg-steel-light border border-amber rounded-lg p-8 text-center">
          <p className="font-mono text-amber text-xs uppercase tracking-widest mb-4">{t('cert_issued_label')}</p>
          <h2 className="font-display font-bold text-3xl uppercase mb-2">{latestCert.workerName}</h2>
          <p className="text-concrete text-sm mb-1">{t('cert_avg_score')}: <span className="text-amber font-bold">{latestCert.avgScore}%</span></p>
          <p className="text-concrete text-xs font-mono mb-6">{new Date(latestCert.issuedAt).toLocaleDateString()}</p>

          <div className="bg-white rounded-lg p-4 inline-block mb-4">
            <QRCodeSVG value={verifyUrl} size={160} />
          </div>
          <p className="font-mono text-xs text-concrete break-all mb-1">{latestCert.id}</p>
          <p className="text-[11px] text-concrete">{t('cert_qr_hint')}</p>

          <div className="flex gap-4 justify-center mt-6">
            <Link
              to={`/verify/${latestCert.id}`}
              className="border border-concrete rounded px-5 py-2.5 font-mono text-xs hover:border-amber hover:text-amber"
            >
              {t('cert_view_verification')}
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-amber text-steel font-bold text-xs uppercase px-5 py-2.5 rounded"
            >
              {t('cert_print')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
