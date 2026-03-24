import { Routes, Route, NavLink } from 'react-router-dom'
import PlayersPage from './pages/PlayersPage.jsx'
import MatchesPage from './pages/MatchesPage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>网球搭档</h1>
        <p className="subtitle">战绩追踪 & 水平评估</p>
      </header>

      <nav className="app-nav">
        <NavLink to="/" end>球员</NavLink>
        <NavLink to="/matches">比赛</NavLink>
        <NavLink to="/stats">统计</NavLink>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<PlayersPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
