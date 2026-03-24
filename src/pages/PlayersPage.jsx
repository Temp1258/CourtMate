import { useState } from 'react'
import { getPlayers, addPlayer, deletePlayer } from '../store.js'

export default function PlayersPage() {
  const [players, setPlayers] = useState(getPlayers)
  const [name, setName] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const result = addPlayer(trimmed)
    if (!result) {
      alert('该球员已存在')
      return
    }
    setPlayers(getPlayers())
    setName('')
  }

  function handleDelete(id, playerName) {
    if (!confirm(`确定要删除 ${playerName} 吗？`)) return
    deletePlayer(id)
    setPlayers(getPlayers())
  }

  const sorted = [...players].sort((a, b) => b.rating - a.rating)

  return (
    <div className="page">
      <h2>球员管理</h2>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="输入球员姓名"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={20}
        />
        <button type="submit">添加</button>
      </form>

      {sorted.length === 0 ? (
        <p className="empty">还没有球员，请先添加</p>
      ) : (
        <div className="player-list">
          <div className="list-header">
            <span className="rank">#</span>
            <span className="name">姓名</span>
            <span className="rating">评分</span>
            <span className="record">战绩</span>
            <span className="actions"></span>
          </div>
          {sorted.map((p, i) => (
            <div key={p.id} className="player-row">
              <span className="rank">{i + 1}</span>
              <span className="name">{p.name}</span>
              <span className="rating">{p.rating}</span>
              <span className="record">{p.wins}胜 {p.losses}负</span>
              <span className="actions">
                <button className="btn-del" onClick={() => handleDelete(p.id, p.name)}>删除</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
