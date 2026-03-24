// localStorage-based data store for match tracking

const PLAYERS_KEY = 'tennis_players'
const MATCHES_KEY = 'tennis_matches'

const INITIAL_RATING = 1500
const K_FACTOR = 32

// --- Sport Configuration ---
export const SPORTS = {
  tennis:     { hasSinglesDoubles: true,  allowsTie: false },
  badminton:  { hasSinglesDoubles: true,  allowsTie: false },
  basketball: { hasSinglesDoubles: false, allowsTie: true  },
  football:   { hasSinglesDoubles: false, allowsTie: true  },
}

// --- Data Migration (existing data → new format) ---
function migrateData() {
  const matches = JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]')
  let changed = false
  for (const m of matches) {
    if (!m.sport) { m.sport = 'tennis'; changed = true }
    if (!m.result) {
      if (m.score1 != null && m.score2 != null) {
        m.result = m.score1 > m.score2 ? 'team1' : m.score1 < m.score2 ? 'team2' : 'tie'
      } else {
        m.result = 'team1'
      }
      changed = true
    }
  }
  if (changed) localStorage.setItem(MATCHES_KEY, JSON.stringify(matches))

  const players = JSON.parse(localStorage.getItem(PLAYERS_KEY) || '[]')
  let pChanged = false
  for (const p of players) {
    if (p.draws == null) { p.draws = 0; pChanged = true }
  }
  if (pChanged) localStorage.setItem(PLAYERS_KEY, JSON.stringify(players))
}
migrateData()

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
    draws: 0,
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

// match: { sport, type, player1Id, player2Id, partner1Id?, partner2Id?, score1?, score2?, result, date }
export function addMatch(match) {
  const matches = getMatches()
  const newMatch = {
    ...match,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
  }
  matches.push(newMatch)
  saveMatches(matches)

  const ratingChanges = updateRatings(newMatch)
  return { match: newMatch, ratingChanges }
}

export function deleteMatch(id) {
  saveMatches(getMatches().filter(m => m.id !== id))
  recalculateAllRatings()
}

// --- ELO Rating System ---

function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

function updateRatings(match) {
  const players = getPlayers()
  const isTeam = match.type === 'doubles' || match.type === 'team'
  const result = match.result // 'team1', 'team2', or 'tie'
  const ratingChanges = {}

  // Actual score for ELO: 1 = win, 0 = loss, 0.5 = tie
  const actual1 = result === 'team1' ? 1 : result === 'tie' ? 0.5 : 0
  const actual2 = result === 'team2' ? 1 : result === 'tie' ? 0.5 : 0

  if (isTeam) {
    const team1 = [match.player1Id, match.partner1Id].filter(Boolean)
    const team2 = [match.player2Id, match.partner2Id].filter(Boolean)
    const avg1 = avgRating(players, team1)
    const avg2 = avgRating(players, team2)
    const e1 = expectedScore(avg1, avg2)

    for (const pid of team1) {
      const p = players.find(x => x.id === pid)
      if (p) {
        const oldRating = p.rating
        p.rating = Math.round(p.rating + K_FACTOR * (actual1 - e1))
        if (result === 'team1') p.wins++
        else if (result === 'tie') p.draws++
        else p.losses++
        ratingChanges[pid] = { name: p.name, oldRating, newRating: p.rating, diff: p.rating - oldRating }
      }
    }
    for (const pid of team2) {
      const p = players.find(x => x.id === pid)
      if (p) {
        const oldRating = p.rating
        p.rating = Math.round(p.rating + K_FACTOR * (actual2 - (1 - e1)))
        if (result === 'team2') p.wins++
        else if (result === 'tie') p.draws++
        else p.losses++
        ratingChanges[pid] = { name: p.name, oldRating, newRating: p.rating, diff: p.rating - oldRating }
      }
    }
  } else {
    const p1 = players.find(x => x.id === match.player1Id)
    const p2 = players.find(x => x.id === match.player2Id)
    if (p1 && p2) {
      const old1 = p1.rating, old2 = p2.rating
      const e1 = expectedScore(p1.rating, p2.rating)
      p1.rating = Math.round(p1.rating + K_FACTOR * (actual1 - e1))
      p2.rating = Math.round(p2.rating + K_FACTOR * (actual2 - (1 - e1)))
      if (result === 'team1') { p1.wins++; p2.losses++ }
      else if (result === 'team2') { p2.wins++; p1.losses++ }
      else { p1.draws++; p2.draws++ }
      ratingChanges[p1.id] = { name: p1.name, oldRating: old1, newRating: p1.rating, diff: p1.rating - old1 }
      ratingChanges[p2.id] = { name: p2.name, oldRating: old2, newRating: p2.rating, diff: p2.rating - old2 }
    }
  }

  savePlayers(players)
  return ratingChanges
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
    p.draws = 0
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

  const partnerStats = {}
  for (const m of playerMatches) {
    let partnerId = null
    const onTeam1 = m.player1Id === playerId || m.partner1Id === playerId
    const result = m.result
    const won = onTeam1 ? result === 'team1' : result === 'team2'
    const tied = result === 'tie'

    if (m.type === 'doubles' || m.type === 'team') {
      if (m.player1Id === playerId) partnerId = m.partner1Id
      else if (m.partner1Id === playerId) partnerId = m.player1Id
      else if (m.player2Id === playerId) partnerId = m.partner2Id
      else if (m.partner2Id === playerId) partnerId = m.player2Id
    } else {
      partnerId = m.player1Id === playerId ? m.player2Id : m.player1Id
    }

    if (partnerId) {
      if (!partnerStats[partnerId]) partnerStats[partnerId] = { wins: 0, losses: 0, draws: 0, total: 0 }
      partnerStats[partnerId].total++
      if (won) partnerStats[partnerId].wins++
      else if (tied) partnerStats[partnerId].draws++
      else partnerStats[partnerId].losses++
    }
  }

  return { playerMatches, partnerStats }
}
