import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import HazardScan from './pages/HazardScan.jsx'
import Scenario from './pages/Scenario.jsx'
import ScenarioList from './pages/ScenarioList.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Settings from './pages/Settings.jsx'
import Certification from './pages/Certification.jsx'
import Verify from './pages/Verify.jsx'
import Admin from './pages/Admin.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import ChatBox from './components/ChatBox.jsx'
import { useLanguage } from './context/LanguageContext.jsx'
import { isPartiallyTranslated } from './lib/i18n.js'

export default function App() {
  const { t, lang } = useLanguage()

  const navItems = [
    { to: '/', key: 'nav_home', end: true },
    { to: '/scan', key: 'nav_scan' },
    { to: '/train', key: 'nav_train' },
    { to: '/certification', key: 'nav_cert' },
    { to: '/dashboard', key: 'nav_dashboard' },
    { to: '/settings', key: 'nav_settings' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-steel-lighter sticky top-0 bg-steel/95 backdrop-blur z-20">
        <div className="stripe-divider" />
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl tracking-wide text-amber font-bold">KHATRA</span>
            <span className="font-mono text-xs text-concrete uppercase tracking-widest">{t('app_subtitle')}</span>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex gap-1 font-mono text-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded transition-colors ${
                      isActive ? 'bg-amber text-steel font-bold' : 'text-concrete hover:text-chalk hover:bg-steel-light'
                    }`
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {isPartiallyTranslated(lang) && (
          <div className="bg-amber/10 border-b border-amber/40 px-5 py-2 text-center text-xs text-amber font-mono">
            {t('sat_notice')}
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<HazardScan />} />
          <Route path="/train" element={<ScenarioList />} />
          <Route path="/train/:id" element={<Scenario />} />
          <Route path="/certification" element={<Certification />} />
          <Route path="/verify/:certId" element={<Verify />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <nav className="md:hidden sticky bottom-0 bg-steel-light border-t border-steel-lighter flex justify-around py-2 font-mono text-[11px]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `px-2 py-1 ${isActive ? 'text-amber font-bold' : 'text-concrete'}`}
          >
            {t(item.key)}
          </NavLink>
        ))}
      </nav>

      <footer className="stripe-divider" />
      <div className="text-center py-2 bg-steel">
        <NavLink to="/admin" className="text-concrete text-[10px] font-mono uppercase tracking-widest hover:text-amber">
          {t('nav_admin')} →
        </NavLink>
      </div>

      <ChatBox />
    </div>
  )
}
