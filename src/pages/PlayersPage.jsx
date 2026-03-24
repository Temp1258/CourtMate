import { useState } from 'react'
import { getPlayers, addPlayer, deletePlayer } from '../store.js'
import { useI18n } from '../i18n.jsx'

export default function PlayersPage() {
  const { t } = useI18n()
  const [players, setPlayers] = useState(getPlayers)
  const [name, setName] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const result = addPlayer(trimmed)
    if (!result) {
      alert(t.playerExists)
      return
    }
    setPlayers(getPlayers())
    setName('')
  }

  function handleDelete(id, playerName) {
    if (!confirm(t.confirmDeletePlayer(playerName))) return
    deletePlayer(id)
    setPlayers(getPlayers())
  }

  const sorted = [...players].sort((a, b) => b.rating - a.rating)

  return (
    <div className="page">
      <h2>{t.playerManagement}</h2>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder={t.enterPlayerName}
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={20}
        />
        <button type="submit">{t.add}</button>
      </form>

      {sorted.length === 0 ? (
        <p className="empty">{t.noPlayersYet}</p>
      ) : (
        <div className="player-list">
          <div className="list-header">
            <span className="rank">{t.rank}</span>
            <span className="name">{t.name}</span>
            <span className="rating">{t.rating}</span>
            <span className="record">{t.record}</span>
            <span className="actions"></span>
          </div>
          {sorted.map((p, i) => (
            <div key={p.id} className="player-row">
              <span className="rank">{i + 1}</span>
              <span className="name">{p.name}</span>
              <span className="rating">{p.rating}</span>
              <span className="record">{p.wins}{t.winSuffix} {p.losses}{t.lossSuffix}</span>
              <span className="actions">
                <button className="btn-del" onClick={() => handleDelete(p.id, p.name)}>{t.delete}</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
