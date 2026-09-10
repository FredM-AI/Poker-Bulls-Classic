export type PlayerStats = {
  gamesPlayed: number
  wins: number
  winRate: number
  finalTables: number
  itmRate: number
  totalWinnings: number
  totalBuyIns: number
  totalRebuys: number
  bestPosition: number | null
  averagePosition: number | null
  seasonStats: {
    [seasonId: string]: {
      seasonName: string
      gamesPlayed: number
      netProfit: number
    }
  }
  profitEvolution: {
    eventName: string
    eventDate: string
    cumulativeProfit: number
  }[]
}

export type Player = {
  id: string
  firstName: string
  lastName: string
  nickname?: string
  email: string
  phone?: string
  avatar?: string
  isGuest?: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type PrizeDistribution = {
  position: number
  amount: number
  percentage: number
}

export type EventResult = {
  playerId: string
  position: number
  prize: number
  rebuys?: number
  eliminatedBy?: string | null
  bountiesWon?: number
  mysteryKoWon?: number
}

export type EventStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export const eventStatuses: EventStatus[] = ['draft', 'active', 'completed', 'cancelled']

export type BlindLevel = {
  level: number
  smallBlind: number
  bigBlind: number
  ante?: number
  duration: number
  isBreak: boolean
}

export type BlindStructureTemplate = {
  id: string
  name: string
  levels: BlindLevel[]
  startingStack?: number
}

export type Event = {
  id: string
  name: string
  date: string
  buyIn: number
  rebuyPrice?: number
  bounties?: number
  mysteryKo?: number
  includeBountiesInNet?: boolean
  maxPlayers?: number
  startingStack?: number
  status: EventStatus
  seasonId?: string | null
  prizePool: {
    total: number
    distributionType: 'automatic' | 'custom'
    distribution: PrizeDistribution[]
  }
  blindStructureId?: string | null
  blindStructure?: BlindLevel[]
  participants: string[]
  results: EventResult[]
  createdAt: string
  updatedAt: string
}

export type Season = {
  id: string
  name: string
  startDate: string
  endDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AppSettings = {
  theme: 'light' | 'dark'
  defaultBuyIn: number
  defaultMaxPlayers: number
}

export interface HofPlayerStat {
  player: Player
  value: number
}

export interface HofEventStat {
  player: Player
  event: Event
  value: number
}

export interface HallOfFameStats {
  mostWins: HofPlayerStat | null
  mostPodiums: HofPlayerStat | null
  highestNet: HofPlayerStat | null
  lowestNet: HofPlayerStat | null
  mostRebuys: HofPlayerStat | null
  mostSpent: HofPlayerStat | null
  biggestSingleWin: HofEventStat | null
  mostBountiesWon: HofPlayerStat | null
  mostConsistent: HofPlayerStat | null
  totalPrizePools: number
}

export type UserRole = 'admin' | 'floor_manager'
