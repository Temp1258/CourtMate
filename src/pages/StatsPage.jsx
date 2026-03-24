import { useState } from 'react'
import { getPlayers, getPlayerStats, getPlayerById } from '../store.js'

export default function StatsPage() {
  const [players] = useState(getPlayers)
  const [selectedId, setSelectedId] = useState('')

  const stats = selectedId ? getPlayerStats(selectedId) : null
  const player = selectedId ? getPlayerById(selectedId) : null

  function winRate(wins, total) {
    if (total === 0) return '0%'
    return (wins / total * 100).toFixed(1) + '%'
  }

  function ratingLevel(rating) {
    if (rating >= 1800) return { label: '高手', color: '#e74c3c' }
    if (rating >= 1600) return { label: '进阶', color: '#f39c12' }
    if (rating >= 1400) return { label: '中等', color: '#3498db' }
    return { label: '初学', color: '#95a5a6' }
  }

  return (
    <div className="page">
      <h2>数据统计</h2>

      <div className="form-row">
        <label>选择球员</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">-- 请选择 --</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {player && stats && (
        <div className="stats-container">
          <div className="stat-card highlight">
            <h3>{player.name}</h3>
            <div className="rating-display">
              <span className="big-number">{player.rating}</span>
              <span className="level-badge" style={{ background: ratingLevel(player.rating).color }}>
                {ratingLevel(player.rating).label}
              </span>
            </div>
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-value">{player.wins + player.losses}</span>
                <span className="stat-label">总场次</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{player.wins}</span>
                <span className="stat-label">胜</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{player.losses}</span>
                <span className="stat-label">负</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{winRate(player.wins, player.wins + player.losses)}</span>
                <span className="stat-label">胜率</span>
              </div>
            </div>
          </div>

          {Object.keys(stats.partnerStats).length > 0 && (
            <>
              <h3>对战 / 搭档分析</h3>
              <div className="partner-list">
                {Object.entries(stats.partnerStats)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([pid, s]) => {
                    const partner = getPlayerById(pid)
                    if (!partner) return null
                    return (
                      <div key={pid} className="partner-card">
                        <div className="partner-name">{partner.name}</div>
                        <div className="partner-rating">评分 {partner.rating}</div>
                        <div className="partner-stats">
                          <span>{s.wins}胜 {s.losses}负</span>
                          <span className="partner-winrate">胜率 {winRate(s.wins, s.total)}</span>
                        </div>
                        <div className="winrate-bar">
                          <div className="winrate-fill" style={{ width: winRate(s.wins, s.total) }}></div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </>
          )}

          {stats.playerMatches.length > 0 && (
            <>
              <h3>最近比赛</h3>
              <div className="recent-matches">
                {[...stats.playerMatches]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map(m => {
                    const onTeam1 = m.player1Id === selectedId || m.partner1Id === selectedId
                    const won = onTeam1 ? m.score1 > m.score2 : m.score2 > m.score1
                    return (
                      <div key={m.id} className={`recent-match ${won ? 'win' : 'loss'}`}>
                        <span className="result-badge">{won ? '胜' : '负'}</span>
                        <span className="match-info">
                          {m.date} | {m.score1}:{m.score2} | {m.type === 'doubles' ? '双打' : '单打'}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </>
          )}
        </div>
      )}

      {players.length > 0 && (
        <>
          <h3>全部球员排名</h3>
          <div className="ranking-list">
            {[...players].sort((a, b) => b.rating - a.rating).map((p, i) => (
              <div key={p.id} className="ranking-row" onClick={() => setSelectedId(p.id)}>
                <span className="rank">{i + 1}</span>
                <span className="name">{p.name}</span>
                <span className="rating">{p.rating}</span>
                <span className="level-badge small" style={{ background: ratingLevel(p.rating).color }}>
                  {ratingLevel(p.rating).label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
