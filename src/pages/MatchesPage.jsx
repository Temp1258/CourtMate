import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayers, getMatches, addMatch, deleteMatch, getPlayerById } from '../store.js'
import { useI18n } from '../i18n.jsx'

export default function MatchesPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [matches, setMatches] = useState(getMatches)
  const [players, setPlayers] = useState(getPlayers)
  const [type, setType] = useState('singles')
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [partner1Id, setPartner1Id] = useState('')
  const [partner2Id, setPartner2Id] = useState('')
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [toast, setToast] = useState(null)

  // Refresh players when page gains focus (after adding players)
  useEffect(() => {
    const refresh = () => setPlayers(getPlayers())
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!player1Id || !player2Id) { alert(t.selectPlayers); return }
    if (type === 'doubles' && (!partner1Id || !partner2Id)) { alert(t.selectPartners); return }
    if (score1 === '' || score2 === '') { alert(t.enterScore); return }

    const s1 = parseInt(score1)
    const s2 = parseInt(score2)
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) { alert(t.invalidScore); return }
    if (s1 === s2) { alert(t.scoreTied); return }

    const allIds = [player1Id, player2Id]
    if (type === 'doubles') { allIds.push(partner1Id, partner2Id) }
    if (new Set(allIds).size !== allIds.length) { alert(t.duplicatePlayers); return }

    const result = addMatch({
      type,
      player1Id,
      player2Id,
      partner1Id: type === 'doubles' ? partner1Id : null,
      partner2Id: type === 'doubles' ? partner2Id : null,
      score1: s1,
      score2: s2,
      date,
    })

    setMatches(getMatches())
    setPlayers(getPlayers())

    // Show rating change toast
    const changes = Object.values(result.ratingChanges)
    setToast(changes)
    setTimeout(() => setToast(null), 4000)

    // Only clear scores — keep player selections for quick rematch
    setScore1('')
    setScore2('')
  }

  function handleRematch() {
    // Swap sides: team1 <-> team2
    const tmpP1 = player1Id
    const tmpPa1 = partner1Id
    setPlayer1Id(player2Id)
    setPartner1Id(partner2Id)
    setPlayer2Id(tmpP1)
    setPartner2Id(tmpPa1)
    setScore1('')
    setScore2('')
    setDate(new Date().toISOString().slice(0, 10))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(id) {
    if (!confirm(t.confirmDeleteMatch)) return
    deleteMatch(id)
    setMatches(getMatches())
    setPlayers(getPlayers())
  }

  function playerName(id) {
    return getPlayerById(id)?.name || t.unknown
  }

  const sortedMatches = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="page">
      <h2>{t.recordMatch}</h2>

      {players.length < 2 ? (
        <div className="empty-guide">
          <div className="empty-guide-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <p className="empty-guide-text">{t.emptyGuideTitle}</p>
          <p className="empty-guide-sub">{t.emptyGuideSub}</p>
          <button className="btn-primary" onClick={() => navigate('/players')} style={{ marginTop: 8 }}>
            {t.goAddPlayers}
          </button>
        </div>
      ) : (
        <form className="match-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>{t.type}</label>
            <div className="toggle-group">
              <button type="button" className={type === 'singles' ? 'active' : ''} onClick={() => setType('singles')}>{t.singles}</button>
              <button type="button" className={type === 'doubles' ? 'active' : ''} onClick={() => setType('doubles')}>{t.doubles}</button>
            </div>
          </div>

          <div className="form-row">
            <label>{t.date}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div className="teams-row">
            <div className="team">
              <h4>{type === 'doubles' ? t.team1 : t.player1}</h4>
              <select value={player1Id} onChange={e => setPlayer1Id(e.target.value)}>
                <option value="">{t.selectPlayer}</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.rating})</option>)}
              </select>
              {type === 'doubles' && (
                <select value={partner1Id} onChange={e => setPartner1Id(e.target.value)}>
                  <option value="">{t.selectPartner}</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.rating})</option>)}
                </select>
              )}
              <input type="number" min="0" placeholder={t.score} value={score1} onChange={e => setScore1(e.target.value)} />
            </div>

            <div className="vs">VS</div>

            <div className="team">
              <h4>{type === 'doubles' ? t.team2 : t.player2}</h4>
              <select value={player2Id} onChange={e => setPlayer2Id(e.target.value)}>
                <option value="">{t.selectPlayer}</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.rating})</option>)}
              </select>
              {type === 'doubles' && (
                <select value={partner2Id} onChange={e => setPartner2Id(e.target.value)}>
                  <option value="">{t.selectPartner}</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.rating})</option>)}
                </select>
              )}
              <input type="number" min="0" placeholder={t.score} value={score2} onChange={e => setScore2(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn-primary">{t.submitMatch}</button>
        </form>
      )}

      {/* Rating change toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <div className="toast-title">{t.matchRecorded}</div>
            <div className="toast-changes">
              {toast.map((c, i) => (
                <div key={i} className="toast-change-row">
                  <span>{c.name}</span>
                  <span className={c.diff >= 0 ? 'rating-up' : 'rating-down'}>
                    {c.diff >= 0 ? '+' : ''}{c.diff} → {c.newRating}
                  </span>
                </div>
              ))}
            </div>
            <button className="btn-rematch" onClick={() => { setToast(null); handleRematch() }}>
              {t.rematch}
            </button>
          </div>
        </div>
      )}

      <h3>{t.matchHistory}</h3>
      {sortedMatches.length === 0 ? (
        <p className="empty">{t.noMatches}</p>
      ) : (
        <div className="match-list">
          {sortedMatches.map(m => (
            <div key={m.id} className="match-card">
              <div className="match-date">{m.date}</div>
              <div className="match-detail">
                <span className={m.score1 > m.score2 ? 'winner' : ''}>
                  {playerName(m.player1Id)}
                  {m.type === 'doubles' && ` & ${playerName(m.partner1Id)}`}
                </span>
                <span className="match-score">
                  <strong>{m.score1}</strong> : <strong>{m.score2}</strong>
                </span>
                <span className={m.score2 > m.score1 ? 'winner' : ''}>
                  {playerName(m.player2Id)}
                  {m.type === 'doubles' && ` & ${playerName(m.partner2Id)}`}
                </span>
              </div>
              <div className="match-meta">
                <span className="match-type">{m.type === 'doubles' ? t.doubles : t.singles}</span>
                <button className="btn-del" onClick={() => handleDelete(m.id)}>{t.delete}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
