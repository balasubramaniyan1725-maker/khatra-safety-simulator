import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Home() {
  const { t } = useLanguage()
  return (
    <div>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-16 pb-20">
        <p className="font-mono text-amber text-xs tracking-[0.2em] uppercase mb-4">
          {t('home_eyebrow')}
        </p>
        <h1 className="font-display font-bold text-6xl md:text-8xl leading-[0.95] uppercase tracking-tight mb-6">
          {t('home_title_1')}
          <br />
          <span className="text-amber">{t('home_title_2')}</span>
          <br />
          {t('home_title_3')}
        </h1>
        <p className="text-concrete text-lg max-w-xl mb-10 leading-relaxed">
          {t('home_desc')}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/scan"
            className="bg-amber text-steel font-display font-bold text-xl uppercase tracking-wide px-8 py-4 rounded hover:bg-white transition-colors"
          >
            {t('home_cta_scan')}
          </Link>
          <Link
            to="/train"
            className="border border-concrete text-chalk font-display font-bold text-xl uppercase tracking-wide px-8 py-4 rounded hover:border-amber hover:text-amber transition-colors"
          >
            {t('home_cta_train')}
          </Link>
        </div>
      </section>

      <div className="stripe-divider" />

      {/* Why it matters — grounded stats */}
      <section className="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-8">
        <Stat number={t('home_stat1_n')} label={t('home_stat1_l')} />
        <Stat number={t('home_stat2_n')} label={t('home_stat2_l')} />
        <Stat number={t('home_stat3_n')} label={t('home_stat3_l')} />
      </section>

      <div className="stripe-divider" />

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <h2 className="font-display font-bold text-4xl uppercase mb-10 tracking-tight">{t('home_how')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard eyebrow={t('home_step1_e')} title={t('home_step1_t')} body={t('home_step1_b')} />
          <StepCard eyebrow={t('home_step2_e')} title={t('home_step2_t')} body={t('home_step2_b')} />
          <StepCard eyebrow={t('home_step3_e')} title={t('home_step3_t')} body={t('home_step3_b')} />
        </div>
      </section>
    </div>
  )
}

function Stat({ number, label }) {
  return (
    <div className="border-t-2 border-amber pt-4">
      <div className="font-display font-bold text-3xl text-amber uppercase mb-2">{number}</div>
      <p className="text-concrete text-sm leading-relaxed">{label}</p>
    </div>
  )
}

function StepCard({ eyebrow, title, body }) {
  return (
    <div className="bg-steel-light rounded p-6 border border-steel-lighter">
      <p className="font-mono text-amber text-xs uppercase tracking-widest mb-3">{eyebrow}</p>
      <h3 className="font-display font-bold text-2xl uppercase mb-3">{title}</h3>
      <p className="text-concrete text-sm leading-relaxed">{body}</p>
    </div>
  )
}
