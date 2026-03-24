import { useState } from 'react'
import { getPlayers, getMatches, addMatch, deleteMatch, getPlayerById } from '../store.js'
import { useI18n } from '../i18n.jsx'

export default function MatchesPage() {
  const { t } = useI18n()
  const [matches, setMatches] = useState(getMatches)
  const [players] = useState(getPlayers)
  const [type, setType] = useState('singles')
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [partner1Id, setPartner1Id] = useState('')
  const [partner2Id, setPartner2Id] = useState('')
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

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

    addMatch({
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
    setScore1('')
    setScore2('')
  }

  function handleDelete(id) {
    if (!confirm(t.confirmDeleteMatch)) return
    deleteMatch(id)
    setMatches(getMatches())
  }

  function playerName(id) {
    return getPlayerById(id)?.name || t.unknown
  }

  const sortedMatches = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="page">
      <h2>{t.recordMatch}</h2>

      {players.length < 2 ? (
        <p className="empty">{t.addMinPlayers}</p>
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
