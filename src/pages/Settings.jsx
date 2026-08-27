import { useState } from 'react'
import { getApiKey, setApiKey, getProvider, setProvider } from '../lib/api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { LANGUAGES } from '../lib/i18n.js'

export default function Settings() {
  const { t, lang, setLang } = useLanguage()
  const [key, setKey] = useState(getApiKey())
  const [provider, setProviderState] = useState(getProvider())
  const [saved, setSaved] = useState(false)

  const save = () => {
    setApiKey(key.trim())
    setProvider(provider)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-10">
      <p className="font-mono text-amber text-xs tracking-[0.2em] uppercase mb-3">{t('set_eyebrow')}</p>
      <h1 className="font-display font-bold text-4xl uppercase mb-8">{t('set_title')}</h1>

      <div className="bg-steel-light border border-steel-lighter rounded-lg p-6 space-y-6">
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-concrete block mb-2">{t('set_language_label')}</label>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`rounded p-2.5 font-mono text-sm border ${
                  lang === l.code ? 'border-amber text-amber bg-amber/10' : 'border-steel-lighter text-concrete'
                }`}
              >
                {l.native}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-concrete block mb-2">{t('set_provider_label')}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setProviderState('gemini')}
              className={`rounded p-3 font-mono text-sm border ${provider === 'gemini' ? 'border-amber text-amber bg-amber/10' : 'border-steel-lighter text-concrete'}`}
            >
              Google Gemini
            </button>
            <button
              onClick={() => setProviderState('openai')}
              className={`rounded p-3 font-mono text-sm border ${provider === 'openai' ? 'border-amber text-amber bg-amber/10' : 'border-steel-lighter text-concrete'}`}
            >
              OpenAI
            </button>
          </div>
          <p className="text-xs text-concrete mt-2">{t('set_provider_hint')}</p>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-concrete block mb-2">{t('set_key_label')}</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={t('set_key_placeholder')}
            className="w-full bg-steel border border-steel-lighter rounded px-4 py-3 font-mono text-sm focus:border-amber outline-none"
          />
          <p className="text-xs text-concrete mt-2">
            {t('set_key_hint1')} {provider === 'gemini' ? 'Google' : 'OpenAI'}'s API.
          </p>
        </div>

        <button onClick={save} className="w-full bg-amber text-steel font-display font-bold text-lg uppercase py-3 rounded">
          {saved ? t('set_saved') : t('set_save')}
        </button>
      </div>

      <div className="mt-8 text-sm text-concrete space-y-2">
        <p className="font-bold text-chalk">{t('set_getting_key')}</p>
        <p>• Gemini: aistudio.google.com/apikey — free tier, no credit card needed for basic use.</p>
        <p>• OpenAI: platform.openai.com/api-keys — requires billing setup on most accounts.</p>
      </div>
    </div>
  )
}
