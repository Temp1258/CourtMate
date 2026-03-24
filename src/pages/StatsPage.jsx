import { useState } from 'react'
import { getPlayers, getPlayerStats, getPlayerById } from '../store.js'
import { useI18n } from '../i18n.jsx'

const SPORT_EMOJIS = { tennis: '🎾', badminton: '🏸', basketball: '🏀', football: '⚽' }

export default function StatsPage() {
  const { t } = useI18n()
  const [players] = useState(getPlayers)
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating)
  const [selectedId, setSelectedId] = useState(() => sortedPlayers.length > 0 ? sortedPlayers[0].id : '')

  const stats = selectedId ? getPlayerStats(selectedId) : null
  const player = selectedId ? getPlayerById(selectedId) : null

  function winRate(wins, total) {
    if (total === 0) return '0%'
    return (wins / total * 100).toFixed(1) + '%'
  }

  function ratingLevel(rating) {
    if (rating >= 1800) return { label: t.levelExpert, color: '#FF3B30' }
    if (rating >= 1600) return { label: t.levelAdvanced, color: '#FF9500' }
    if (rating >= 1400) return { label: t.levelIntermediate, color: '#007AFF' }
    return { label: t.levelBeginner, color: '#8E8E93' }
  }

  return (
    <div className="page">
      <h2>{t.statistics}</h2>

      <div className="form-row">
        <label>{t.selectPlayerLabel}</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">{t.pleaseSelect}</option>
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
                <span className="stat-value">{player.wins + player.losses + player.draws}</span>
                <span className="stat-label">{t.totalMatches}</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{player.wins}</span>
                <span className="stat-label">{t.win}</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{player.losses}</span>
                <span className="stat-label">{t.loss}</span>
              </div>
              {player.draws > 0 && (
                <div className="stat-item">
                  <span className="stat-value">{player.draws}</span>
                  <span className="stat-label">{t.draw}</span>
                </div>
              )}
              <div className="stat-item">
                <span className="stat-value">{winRate(player.wins, player.wins + player.losses + player.draws)}</span>
                <span className="stat-label">{t.winRate}</span>
              </div>
            </div>
          </div>

          {Object.keys(stats.partnerStats).length > 0 && (
            <>
              <h3>{t.partnerAnalysis}</h3>
              <div className="partner-list">
                {Object.entries(stats.partnerStats)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([pid, s]) => {
                    const partner = getPlayerById(pid)
                    if (!partner) return null
                    return (
                      <div key={pid} className="partner-card">
                        <div className="partner-name">{partner.name}</div>
                        <div className="partner-rating">{t.ratingLabel} {partner.rating}</div>
                        <div className="partner-stats">
                          <span>
                            {s.wins}{t.winSuffix} {s.losses}{t.lossSuffix}
                            {s.draws > 0 && ` ${s.draws}${t.drawSuffix}`}
                          </span>
                          <span className="partner-winrate">{t.winRate} {winRate(s.wins, s.total)}</span>
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
              <h3>{t.recentMatches}</h3>
              <div className="recent-matches">
                {[...stats.playerMatches]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map(m => {
                    const onTeam1 = m.player1Id === selectedId || m.partner1Id === selectedId
                    const won = onTeam1 ? m.result === 'team1' : m.result === 'team2'
                    const tied = m.result === 'tie'
                    return (
                      <div key={m.id} className={`recent-match ${won ? 'win' : tied ? 'draw' : 'loss'}`}>
                        <span className="result-badge">
                          {won ? t.win : tied ? t.draw : t.loss}
                        </span>
                        <span className="match-info">
                          {SPORT_EMOJIS[m.sport] || '🎾'} {m.date}
                          {m.score1 != null && ` | ${m.score1}:${m.score2}`}
                          {' | '}{m.type === 'doubles' ? t.doubles : m.type === 'team' ? t.team : t.singles}
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
          <h3>{t.allRankings}</h3>
          <div className="ranking-list">
            {sortedPlayers.map((p, i) => (
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
