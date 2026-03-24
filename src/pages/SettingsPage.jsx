import { useI18n } from '../i18n.jsx'

export default function SettingsPage() {
  const { lang, setLang, t } = useI18n()

  return (
    <div className="page">
      <h2>{t.settings}</h2>

      <div className="settings-card">
        <div className="settings-row">
          <span className="settings-label">{t.language}</span>
          <div className="lang-toggle">
            <button
              className={lang === 'zh' ? 'active' : ''}
              onClick={() => setLang('zh')}
            >
              中文
            </button>
            <button
              className={lang === 'en' ? 'active' : ''}
              onClick={() => setLang('en')}
            >
              English
            </button>
          </div>
        </div>
      </div>

      <div className="about-card">
        <div className="about-name">{t.appName}</div>
        <div className="about-subtitle">{t.appSubtitle}</div>
        <div className="about-version">v1.0.0</div>
      </div>
    </div>
  )
}
