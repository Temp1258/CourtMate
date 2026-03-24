// localStorage-based data store for tennis match tracking

const PLAYERS_KEY = 'tennis_players'
const MATCHES_KEY = 'tennis_matches'

const INITIAL_RATING = 1500
const K_FACTOR = 32

// --- Player CRUD ---

export function getPlayers() {
  const data = localStorage.getItem(PLAYERS_KEY)
  return data ? JSON.parse(data) : []
}

function savePlayers(players) {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players))
}

export function addPlayer(name) {
  const players = getPlayers()
  if (players.some(p => p.name === name)) return null
  const player = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    rating: INITIAL_RATING,
    wins: 0,
    losses: 0,
    createdAt: new Date().toISOString(),
  }
  players.push(player)
  savePlayers(players)
  return player
}

export function deletePlayer(id) {
  savePlayers(getPlayers().filter(p => p.id !== id))
}

export function getPlayerById(id) {
  return getPlayers().find(p => p.id === id) || null
}

// --- Match CRUD ---

export function getMatches() {
  const data = localStorage.getItem(MATCHES_KEY)
  return data ? JSON.parse(data) : []
}

function saveMatches(matches) {
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches))
}

// match: { player1Id, player2Id, partner1Id?, partner2Id?, score1, score2, date, type: 'singles'|'doubles' }
export function addMatch(match) {
  const matches = getMatches()
  const newMatch = {
    ...match,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
  }
  matches.push(newMatch)
  saveMatches(matches)

  // Update ratings
  updateRatings(newMatch)

  return newMatch
}

export function deleteMatch(id) {
  saveMatches(getMatches().filter(m => m.id !== id))
  // Recalculate all ratings from scratch
  recalculateAllRatings()
}

// --- ELO Rating System ---

function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

function updateRatings(match) {
  const players = getPlayers()
  const isDoubles = match.type === 'doubles'
  const won1 = match.score1 > match.score2

  if (isDoubles) {
    const team1 = [match.player1Id, match.partner1Id].filter(Boolean)
    const team2 = [match.player2Id, match.partner2Id].filter(Boolean)
    const avg1 = avgRating(players, team1)
    const avg2 = avgRating(players, team2)
    const e1 = expectedScore(avg1, avg2)

    for (const pid of team1) {
      const p = players.find(x => x.id === pid)
      if (p) {
        p.rating = Math.round(p.rating + K_FACTOR * ((won1 ? 1 : 0) - e1))
        if (won1) p.wins++; else p.losses++
      }
    }
    for (const pid of team2) {
      const p = players.find(x => x.id === pid)
      if (p) {
        p.rating = Math.round(p.rating + K_FACTOR * ((won1 ? 0 : 1) - (1 - e1)))
        if (!won1) p.wins++; else p.losses++
      }
    }
  } else {
    const p1 = players.find(x => x.id === match.player1Id)
    const p2 = players.find(x => x.id === match.player2Id)
    if (p1 && p2) {
      const e1 = expectedScore(p1.rating, p2.rating)
      p1.rating = Math.round(p1.rating + K_FACTOR * ((won1 ? 1 : 0) - e1))
      p2.rating = Math.round(p2.rating + K_FACTOR * ((won1 ? 0 : 1) - (1 - e1)))
      if (won1) { p1.wins++; p2.losses++ } else { p2.wins++; p1.losses++ }
    }
  }

  savePlayers(players)
}

function avgRating(players, ids) {
  const ratings = ids.map(id => players.find(p => p.id === id)?.rating || INITIAL_RATING)
  return ratings.reduce((a, b) => a + b, 0) / ratings.length
}

function recalculateAllRatings() {
  const players = getPlayers()
  for (const p of players) {
    p.rating = INITIAL_RATING
    p.wins = 0
    p.losses = 0
  }
  savePlayers(players)

  const matches = getMatches()
  for (const m of matches) {
    updateRatings(m)
  }
}

// --- Stats ---

export function getPlayerStats(playerId) {
  const matches = getMatches()
  const playerMatches = matches.filter(m =>
    m.player1Id === playerId || m.player2Id === playerId ||
    m.partner1Id === playerId || m.partner2Id === playerId
  )

  // Partner analysis
  const partnerStats = {}
  for (const m of playerMatches) {
    let partnerId = null
    let won = false

    if (m.type === 'doubles') {
      if (m.player1Id === playerId) partnerId = m.partner1Id
      else if (m.partner1Id === playerId) partnerId = m.player1Id
      else if (m.player2Id === playerId) partnerId = m.partner2Id
      else if (m.partner2Id === playerId) partnerId = m.player2Id

      const onTeam1 = m.player1Id === playerId || m.partner1Id === playerId
      won = onTeam1 ? m.score1 > m.score2 : m.score2 > m.score1
    } else {
      // In singles, the opponent is the "partner" for opponent analysis
      partnerId = m.player1Id === playerId ? m.player2Id : m.player1Id
      won = m.player1Id === playerId ? m.score1 > m.score2 : m.score2 > m.score1
    }

    if (partnerId) {
      if (!partnerStats[partnerId]) partnerStats[partnerId] = { wins: 0, losses: 0, total: 0 }
      partnerStats[partnerId].total++
      if (won) partnerStats[partnerId].wins++
      else partnerStats[partnerId].losses++
    }
  }

  return { playerMatches, partnerStats }
}
