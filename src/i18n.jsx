import { createContext, useContext, useState, useCallback } from 'react'

const translations = {
  zh: {
    // App
    appName: '拍档',
    appSubtitle: '战绩追踪 & 水平评估',

    // Tab bar
    tabPlayers: '球员',
    tabRecord: '记录',
    tabStats: '统计',

    // Players page
    playerManagement: '球员管理',
    enterPlayerName: '输入球员姓名',
    add: '添加',
    noPlayersYet: '还没有球员，请先添加',
    rank: '#',
    name: '姓名',
    rating: '评分',
    record: '战绩',
    delete: '删除',
    playerExists: '该球员已存在',
    confirmDeletePlayer: (name) => `确定要删除 ${name} 吗？`,
    winSuffix: '胜',
    lossSuffix: '负',

    // Matches page
    recordMatch: '记录比赛',
    addMinPlayers: '请先添加至少2名球员',
    type: '类型',
    singles: '单打',
    doubles: '双打',
    date: '日期',
    team1: '队伍1',
    team2: '队伍2',
    player1: '球员1',
    player2: '球员2',
    selectPlayer: '选择球员',
    selectPartner: '选择搭档',
    score: '比分',
    submitMatch: '提交比赛',
    matchHistory: '比赛记录',
    noMatches: '暂无比赛记录',
    confirmDeleteMatch: '确定要删除这条比赛记录吗？',
    unknown: '未知',
    selectPlayers: '请选择球员',
    selectPartners: '双打请选择搭档',
    enterScore: '请输入比分',
    invalidScore: '比分无效',
    scoreTied: '比分不能相同',
    duplicatePlayers: '不能选择重复的球员',

    // Stats page
    statistics: '数据统计',
    selectPlayerLabel: '选择球员',
    pleaseSelect: '-- 请选择 --',
    totalMatches: '总场次',
    win: '胜',
    loss: '负',
    winRate: '胜率',
    partnerAnalysis: '对战 / 搭档分析',
    ratingLabel: '评分',
    recentMatches: '最近比赛',
    allRankings: '全部球员排名',

    // Rating levels
    levelExpert: '高手',
    levelAdvanced: '进阶',
    levelIntermediate: '中等',
    levelBeginner: '初学',

    // Settings
    language: '语言',
    settings: '设置',
  },
  en: {
    // App
    appName: 'CourtMate',
    appSubtitle: 'Match Tracking & Skill Rating',

    // Tab bar
    tabPlayers: 'Players',
    tabRecord: 'Record',
    tabStats: 'Stats',

    // Players page
    playerManagement: 'Players',
    enterPlayerName: 'Player name',
    add: 'Add',
    noPlayersYet: 'No players yet. Add one to start!',
    rank: '#',
    name: 'Name',
    rating: 'Rating',
    record: 'Record',
    delete: 'Del',
    playerExists: 'Player already exists',
    confirmDeletePlayer: (name) => `Delete ${name}?`,
    winSuffix: 'W',
    lossSuffix: 'L',

    // Matches page
    recordMatch: 'Record Match',
    addMinPlayers: 'Add at least 2 players first',
    type: 'Type',
    singles: 'Singles',
    doubles: 'Doubles',
    date: 'Date',
    team1: 'Team 1',
    team2: 'Team 2',
    player1: 'Player 1',
    player2: 'Player 2',
    selectPlayer: 'Select player',
    selectPartner: 'Select partner',
    score: 'Score',
    submitMatch: 'Submit Match',
    matchHistory: 'Match History',
    noMatches: 'No matches recorded yet',
    confirmDeleteMatch: 'Delete this match?',
    unknown: 'Unknown',
    selectPlayers: 'Please select players',
    selectPartners: 'Please select partners for doubles',
    enterScore: 'Please enter scores',
    invalidScore: 'Invalid score',
    scoreTied: 'Scores cannot be tied',
    duplicatePlayers: 'Cannot select duplicate players',

    // Stats page
    statistics: 'Statistics',
    selectPlayerLabel: 'Player',
    pleaseSelect: '-- Select --',
    totalMatches: 'Matches',
    win: 'W',
    loss: 'L',
    winRate: 'Win%',
    partnerAnalysis: 'Opponent / Partner Analysis',
    ratingLabel: 'Rating',
    recentMatches: 'Recent Matches',
    allRankings: 'All Player Rankings',

    // Rating levels
    levelExpert: 'Expert',
    levelAdvanced: 'Advanced',
    levelIntermediate: 'Mid',
    levelBeginner: 'Beginner',

    // Settings
    language: 'Language',
    settings: 'Settings',
  },
}

const LANG_KEY = 'courtmate_lang'

function getInitialLang() {
  const saved = localStorage.getItem(LANG_KEY)
  if (saved && translations[saved]) return saved
  return 'zh'
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang)

  const setLang = useCallback((l) => {
    setLangState(l)
    localStorage.setItem(LANG_KEY, l)
  }, [])

  const t = translations[lang]

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
