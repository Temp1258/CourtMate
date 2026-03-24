import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayers, getMatches, addMatch, deleteMatch, getPlayerById, SPORTS } from '../store.js'
import { useI18n } from '../i18n.jsx'

const SPORT_EMOJIS = { tennis: '🎾', badminton: '🏸', basketball: '🏀', football: '⚽' }
const LAST_SPORT_KEY = 'courtmate_last_sport'

export default function MatchesPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [matches, setMatches] = useState(getMatches)
  const [players, setPlayers] = useState(getPlayers)

  // Form state
  const [sport, setSportState] = useState(() => localStorage.getItem(LAST_SPORT_KEY) || 'tennis')
  const [type, setType] = useState('singles') // singles | doubles | team
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [partner1Id, setPartner1Id] = useState('')
  const [partner2Id, setPartner2Id] = useState('')
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')
  const [result, setResult] = useState('') // team1 | team2 | tie
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [toast, setToast] = useState(null)

  const sportConfig = SPORTS[sport]
  const isTeamMode = type === 'doubles' || type === 'team'

  // When sport changes, adjust type
  function setSport(s) {
    setSportState(s)
    localStorage.setItem(LAST_SPORT_KEY, s)
    if (!SPORTS[s].hasSinglesDoubles) {
      setType('team')
    } else {
      setType('singles')
    }
    setResult('')
  }

  // Auto-determine result from scores
  useEffect(() => {
    if (score1 !== '' && score2 !== '') {
      const s1 = parseInt(score1), s2 = parseInt(score2)
      if (!isNaN(s1) && !isNaN(s2)) {
        if (s1 > s2) setResult('team1')
        else if (s2 > s1) setResult('team2')
        else if (sportConfig.allowsTie) setResult('tie')
        else setResult('')
      }
    }
  }, [score1, score2, sportConfig.allowsTie])

  // Refresh players on focus
  useEffect(() => {
    const refresh = () => setPlayers(getPlayers())
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!player1Id || !player2Id) { alert(t.selectPlayers); return }
    if (isTeamMode && (!partner1Id || !partner2Id)) { alert(t.selectPartners); return }

    // Validate scores if provided
    let s1 = null, s2 = null
    if (score1 !== '' || score2 !== '') {
      s1 = parseInt(score1); s2 = parseInt(score2)
      if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) { alert(t.invalidScore); return }
      if (s1 === s2 && !sportConfig.allowsTie) { alert(t.scoreTied); return }
    }

    // Must have a result
    if (!result) { alert(t.selectResult); return }

    const allIds = [player1Id, player2Id]
    if (isTeamMode) { allIds.push(partner1Id, partner2Id) }
    if (new Set(allIds).size !== allIds.length) { alert(t.duplicatePlayers); return }

    const matchResult = addMatch({
      sport,
      type,
      player1Id,
      player2Id,
      partner1Id: isTeamMode ? partner1Id : null,
      partner2Id: isTeamMode ? partner2Id : null,
      score1: s1,
      score2: s2,
      result,
      date,
    })

    setMatches(getMatches())
    setPlayers(getPlayers())

    // Show rating change toast
    const changes = Object.values(matchResult.ratingChanges)
    setToast(changes)
    setTimeout(() => setToast(null), 4000)

    // Clear scores & result, keep players for quick rematch
    setScore1('')
    setScore2('')
    setResult('')
  }

  function handleRematch() {
    const tmpP1 = player1Id, tmpPa1 = partner1Id
    setPlayer1Id(player2Id)
    setPartner1Id(partner2Id)
    setPlayer2Id(tmpP1)
    setPartner2Id(tmpPa1)
    setScore1('')
    setScore2('')
    setResult('')
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

  function sportLabel(s) {
    return t[s] || s
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
          {/* Sport selector */}
          <div className="sport-selector">
            {Object.keys(SPORTS).map(s => (
              <button
                key={s}
                type="button"
                className={`sport-btn ${sport === s ? 'active' : ''}`}
                onClick={() => setSport(s)}
              >
                <span className="sport-emoji">{SPORT_EMOJIS[s]}</span>
                <span className="sport-name">{sportLabel(s)}</span>
              </button>
            ))}
          </div>

          {/* Singles/Doubles toggle - only for racket sports */}
          {sportConfig.hasSinglesDoubles && (
            <div className="form-row">
              <label>{t.type}</label>
              <div className="toggle-group">
                <button type="button" className={type === 'singles' ? 'active' : ''} onClick={() => setType('singles')}>{t.singles}</button>
                <button type="button" className={type === 'doubles' ? 'active' : ''} onClick={() => setType('doubles')}>{t.doubles}</button>
              </div>
            </div>
          )}

          <div className="form-row">
            <label>{t.date}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {/* Player selectors */}
          <div className="teams-row">
            <div className="team">
              <h4>{isTeamMode ? t.team1 : t.player1}</h4>
              <select value={player1Id} onChange={e => setPlayer1Id(e.target.value)}>
                <option value="">{t.selectPlayer}</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.rating})</option>)}
              </select>
              {isTeamMode && (
                <select value={partner1Id} onChange={e => setPartner1Id(e.target.value)}>
                  <option value="">{t.selectPartner}</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.rating})</option>)}
                </select>
              )}
              <input type="number" min="0" placeholder={`${t.score}(${t.scoreOptional})`} value={score1} onChange={e => setScore1(e.target.value)} />
            </div>

            <div className="vs">VS</div>

            <div className="team">
              <h4>{isTeamMode ? t.team2 : t.player2}</h4>
              <select value={player2Id} onChange={e => setPlayer2Id(e.target.value)}>
                <option value="">{t.selectPlayer}</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.rating})</option>)}
              </select>
              {isTeamMode && (
                <select value={partner2Id} onChange={e => setPartner2Id(e.target.value)}>
                  <option value="">{t.selectPartner}</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.rating})</option>)}
                </select>
              )}
              <input type="number" min="0" placeholder={`${t.score}(${t.scoreOptional})`} value={score2} onChange={e => setScore2(e.target.value)} />
            </div>
          </div>

          {/* Winner selector */}
          <div className="form-row">
            <label>{t.whoWon}</label>
            <div className="toggle-group result-toggle">
              <button type="button" className={result === 'team1' ? 'active win-active' : ''} onClick={() => setResult('team1')}>{t.team1Won}</button>
              {sportConfig.allowsTie && (
                <button type="button" className={result === 'tie' ? 'active tie-active' : ''} onClick={() => setResult('tie')}>{t.tied}</button>
              )}
              <button type="button" className={result === 'team2' ? 'active win-active' : ''} onClick={() => setResult('team2')}>{t.team2Won}</button>
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
                  <span className={c.diff > 0 ? 'rating-up' : c.diff < 0 ? 'rating-down' : ''}>
                    {c.diff > 0 ? '+' : ''}{c.diff} → {c.newRating}
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
          {sortedMatches.map(m => {
            const hasScore = m.score1 != null && m.score2 != null
            return (
              <div key={m.id} className="match-card">
                <div className="match-date">
                  <span>{SPORT_EMOJIS[m.sport] || '🎾'} {sportLabel(m.sport)}</span>
                  <span>{m.date}</span>
                </div>
                <div className="match-detail">
                  <span className={m.result === 'team1' ? 'winner' : ''}>
                    {playerName(m.player1Id)}
                    {(m.type === 'doubles' || m.type === 'team') && ` & ${playerName(m.partner1Id)}`}
                  </span>
                  <span className="match-score">
                    {hasScore ? (
                      <><strong>{m.score1}</strong> : <strong>{m.score2}</strong></>
                    ) : (
                      <span className={`result-text ${m.result}`}>
                        {m.result === 'team1' ? t.winLabel : m.result === 'team2' ? t.lossLabel : t.drawLabel}
                        {' : '}
                        {m.result === 'team2' ? t.winLabel : m.result === 'team1' ? t.lossLabel : t.drawLabel}
                      </span>
                    )}
                  </span>
                  <span className={m.result === 'team2' ? 'winner' : ''}>
                    {playerName(m.player2Id)}
                    {(m.type === 'doubles' || m.type === 'team') && ` & ${playerName(m.partner2Id)}`}
                  </span>
                </div>
                <div className="match-meta">
                  <span className="match-type">
                    {m.type === 'doubles' ? t.doubles : m.type === 'team' ? t.team : t.singles}
                  </span>
                  <button className="btn-del" onClick={() => handleDelete(m.id)}>{t.delete}</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
