import { Routes, Route, NavLink } from 'react-router-dom'
import PlayersPage from './pages/PlayersPage.jsx'
import MatchesPage from './pages/MatchesPage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<PlayersPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>

      <nav className="tab-bar">
        <NavLink to="/" end className="tab-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>球员</span>
        </NavLink>
        <NavLink to="/matches" className="tab-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <span>记录</span>
        </NavLink>
        <NavLink to="/stats" className="tab-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          <span>统计</span>
        </NavLink>
      </nav>
    </div>
  )
}

export default App
