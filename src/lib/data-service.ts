import { supabase } from './supabase'
import type {
  AppSettings,
  BlindLevel,
  BlindStructureTemplate,
  Event,
  EventResult,
  EventStatus,
  Player,
  Season,
} from './types'

// ---------------------------------------------------------------------------
// Mapping helpers (snake_case DB rows <-> camelCase app types)
// ---------------------------------------------------------------------------

function mapPlayer(row: any): Player {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    nickname: row.nickname ?? undefined,
    email: row.email,
    phone: row.phone ?? undefined,
    avatar: row.avatar_url ?? undefined,
    isGuest: row.is_guest ?? false,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapSeason(row: any): Season {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapBlindStructure(row: any): BlindStructureTemplate {
  return {
    id: row.id,
    name: row.name,
    levels: row.levels ?? [],
    startingStack: row.starting_stack ?? undefined,
  }
}

function mapEvent(
  row: any,
  participants: string[],
  results: EventResult[],
): Event {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    buyIn: Number(row.buy_in ?? 0),
    rebuyPrice: row.rebuy_price != null ? Number(row.rebuy_price) : undefined,
    bounties: row.bounties != null ? Number(row.bounties) : undefined,
    mysteryKo: row.mystery_ko != null ? Number(row.mystery_ko) : undefined,
    includeBountiesInNet: row.include_bounties_in_net ?? true,
    maxPlayers: row.max_players ?? undefined,
    startingStack: row.starting_stack ?? undefined,
    status: row.status as EventStatus,
    seasonId: row.season_id ?? null,
    prizePool: {
      total: Number(row.prize_pool_total ?? 0),
      distributionType: row.prize_pool_distribution_type ?? 'automatic',
      distribution: row.prize_pool_distribution ?? [],
    },
    blindStructureId: row.blind_structure_id ?? undefined,
    blindStructure: row.blind_structure_snapshot ?? undefined,
    participants,
    results,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from('players').select('*').order('last_name')
  if (error) throw error
  return (data ?? []).map(mapPlayer)
}

export async function getPlayer(id: string): Promise<Player | null> {
  const { data, error } = await supabase.from('players').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapPlayer(data) : null
}

export async function isEmailTaken(email: string, excludePlayerId?: string): Promise<boolean> {
  let query = supabase.from('players').select('id').eq('email', email)
  if (excludePlayerId) query = query.neq('id', excludePlayerId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).length > 0
}

export type PlayerInput = {
  firstName: string
  lastName: string
  nickname?: string
  email: string
  phone?: string
  avatar?: string
  isActive: boolean
  isGuest: boolean
}

export async function createPlayer(input: PlayerInput): Promise<Player> {
  if (await isEmailTaken(input.email)) {
    throw new Error('Email already exists.')
  }
  const { data, error } = await supabase
    .from('players')
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      nickname: input.nickname || null,
      email: input.email,
      phone: input.phone || null,
      avatar_url: input.avatar || null,
      is_active: input.isActive,
      is_guest: input.isGuest,
    })
    .select()
    .single()
  if (error) throw error
  return mapPlayer(data)
}

export async function updatePlayer(id: string, input: PlayerInput): Promise<Player> {
  if (await isEmailTaken(input.email, id)) {
    throw new Error('Email already exists for another player.')
  }
  const { data, error } = await supabase
    .from('players')
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      nickname: input.nickname || null,
      email: input.email,
      phone: input.phone || null,
      avatar_url: input.avatar || null,
      is_active: input.isActive,
      is_guest: input.isGuest,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapPlayer(data)
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) throw error
}

export type PlayerImportEntry = {
  id?: string
  firstName: string
  lastName: string
  nickname?: string
  email: string
  phone?: string
  avatar?: string
  isActive?: boolean
  isGuest?: boolean
  createdAt?: string
  updatedAt?: string
}

export async function importPlayers(
  entries: PlayerImportEntry[],
): Promise<{ successCount: number; skippedCount: number }> {
  const existing = await getPlayers()
  const existingEmails = new Set(existing.map((p) => p.email.toLowerCase()))
  const existingIds = new Set(existing.map((p) => p.id))

  const toInsert: any[] = []
  let skippedCount = 0

  for (const entry of entries) {
    if (entry.id && existingIds.has(entry.id)) {
      skippedCount++
      continue
    }
    if (existingEmails.has(entry.email.toLowerCase())) {
      skippedCount++
      continue
    }
    existingEmails.add(entry.email.toLowerCase())
    toInsert.push({
      ...(entry.id ? { id: entry.id } : {}),
      first_name: entry.firstName,
      last_name: entry.lastName,
      nickname: entry.nickname || null,
      email: entry.email,
      phone: entry.phone || null,
      avatar_url: entry.avatar || null,
      is_active: entry.isActive ?? true,
      is_guest: entry.isGuest ?? false,
      created_at: entry.createdAt ?? new Date().toISOString(),
      updated_at: entry.updatedAt ?? new Date().toISOString(),
    })
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from('players').insert(toInsert)
    if (error) throw error
  }

  return { successCount: toInsert.length, skippedCount }
}

// ---------------------------------------------------------------------------
// Seasons
// ---------------------------------------------------------------------------

export async function getSeasons(): Promise<Season[]> {
  const { data, error } = await supabase.from('seasons').select('*').order('start_date', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapSeason)
}

export async function getSeason(id: string): Promise<Season | null> {
  const { data, error } = await supabase.from('seasons').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapSeason(data) : null
}

export type SeasonInput = {
  name: string
  startDate: string
  endDate?: string
  isActive: boolean
  eventIdsToAssociate: string[]
}

export async function createSeason(input: SeasonInput): Promise<Season> {
  const { data, error } = await supabase
    .from('seasons')
    .insert({
      name: input.name,
      start_date: input.startDate,
      end_date: input.endDate || null,
      is_active: input.isActive,
    })
    .select()
    .single()
  if (error) throw error

  if (input.eventIdsToAssociate.length > 0) {
    const { error: assocError } = await supabase
      .from('events')
      .update({ season_id: data.id })
      .in('id', input.eventIdsToAssociate)
    if (assocError) throw assocError
  }

  return mapSeason(data)
}

export async function updateSeason(id: string, input: SeasonInput): Promise<Season> {
  const { data, error } = await supabase
    .from('seasons')
    .update({
      name: input.name,
      start_date: input.startDate,
      end_date: input.endDate || null,
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  const toAssociate = new Set(input.eventIdsToAssociate)
  const { data: currentlyAssociated, error: curError } = await supabase
    .from('events')
    .select('id')
    .eq('season_id', id)
  if (curError) throw curError
  const currentIds = new Set((currentlyAssociated ?? []).map((e) => e.id))

  const toDissociate = [...currentIds].filter((eventId) => !toAssociate.has(eventId))
  const toAdd = [...toAssociate].filter((eventId) => !currentIds.has(eventId))

  if (toDissociate.length > 0) {
    const { error: dissocError } = await supabase.from('events').update({ season_id: null }).in('id', toDissociate)
    if (dissocError) throw dissocError
  }
  if (toAdd.length > 0) {
    const { error: addError } = await supabase.from('events').update({ season_id: id }).in('id', toAdd)
    if (addError) throw addError
  }

  return mapSeason(data)
}

export async function deleteSeason(id: string): Promise<void> {
  const { error: dissocError } = await supabase.from('events').update({ season_id: null }).eq('season_id', id)
  if (dissocError) throw dissocError
  const { error } = await supabase.from('seasons').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Blind structures
// ---------------------------------------------------------------------------

export async function getBlindStructures(): Promise<BlindStructureTemplate[]> {
  const { data, error } = await supabase.from('blind_structures').select('*').order('name')
  if (error) throw error
  return (data ?? []).map(mapBlindStructure)
}

export async function saveBlindStructure(structure: BlindStructureTemplate): Promise<BlindStructureTemplate> {
  const { data, error } = await supabase
    .from('blind_structures')
    .upsert({
      id: structure.id,
      name: structure.name,
      starting_stack: structure.startingStack ?? null,
      levels: structure.levels,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return mapBlindStructure(data)
}

export async function deleteBlindStructure(id: string): Promise<void> {
  const { error } = await supabase.from('blind_structures').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

async function attachParticipantsAndResults(eventRows: any[]): Promise<Event[]> {
  if (eventRows.length === 0) return []
  const eventIds = eventRows.map((e) => e.id)

  const [{ data: participantRows, error: pError }, { data: resultRows, error: rError }] = await Promise.all([
    supabase.from('event_participants').select('*').in('event_id', eventIds),
    supabase.from('event_results').select('*').in('event_id', eventIds),
  ])
  if (pError) throw pError
  if (rError) throw rError

  const participantsByEvent = new Map<string, string[]>()
  for (const row of participantRows ?? []) {
    const list = participantsByEvent.get(row.event_id) ?? []
    list.push(row.player_id)
    participantsByEvent.set(row.event_id, list)
  }

  const resultsByEvent = new Map<string, EventResult[]>()
  for (const row of resultRows ?? []) {
    const list = resultsByEvent.get(row.event_id) ?? []
    list.push({
      playerId: row.player_id,
      position: row.position,
      prize: Number(row.prize),
      rebuys: row.rebuys ?? 0,
      eliminatedBy: row.eliminated_by ?? null,
      bountiesWon: Number(row.bounties_won ?? 0),
      mysteryKoWon: Number(row.mystery_ko_won ?? 0),
    })
    resultsByEvent.set(row.event_id, list)
  }

  return eventRows.map((row) =>
    mapEvent(row, participantsByEvent.get(row.id) ?? [], resultsByEvent.get(row.id) ?? []),
  )
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false })
  if (error) throw error
  return attachParticipantsAndResults(data ?? [])
}

export async function getEvent(id: string): Promise<Event | null> {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) return null
  const [event] = await attachParticipantsAndResults([data])
  return event
}

export type EventInput = {
  name: string
  date: string
  buyIn: number
  rebuyPrice?: number
  bounties?: number
  mysteryKo?: number
  includeBountiesInNet: boolean
  maxPlayers?: number
  startingStack?: number
  status: EventStatus
  seasonId?: string | null
  blindStructureId?: string | null
  blindStructureSnapshot?: BlindLevel[]
  prizePoolTotal: number
  participantIds: string[]
  results: EventResult[]
}

async function replaceParticipantsAndResults(eventId: string, input: EventInput): Promise<void> {
  const { error: delPError } = await supabase.from('event_participants').delete().eq('event_id', eventId)
  if (delPError) throw delPError
  if (input.participantIds.length > 0) {
    const { error: insPError } = await supabase
      .from('event_participants')
      .insert(input.participantIds.map((playerId) => ({ event_id: eventId, player_id: playerId })))
    if (insPError) throw insPError
  }

  const { error: delRError } = await supabase.from('event_results').delete().eq('event_id', eventId)
  if (delRError) throw delRError
  if (input.results.length > 0) {
    const { error: insRError } = await supabase.from('event_results').insert(
      input.results.map((r) => ({
        event_id: eventId,
        player_id: r.playerId,
        position: r.position,
        prize: r.prize,
        rebuys: r.rebuys ?? 0,
        eliminated_by: r.eliminatedBy || null,
        bounties_won: r.bountiesWon ?? 0,
        mystery_ko_won: r.mysteryKoWon ?? 0,
      })),
    )
    if (insRError) throw insRError
  }
}

export async function createEvent(input: EventInput): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      name: input.name,
      date: new Date(input.date).toISOString(),
      buy_in: input.buyIn,
      rebuy_price: input.rebuyPrice ?? null,
      bounties: input.bounties ?? null,
      mystery_ko: input.mysteryKo ?? null,
      include_bounties_in_net: input.includeBountiesInNet,
      max_players: input.maxPlayers ?? null,
      starting_stack: input.startingStack ?? null,
      status: input.status,
      season_id: input.seasonId ?? null,
      blind_structure_id: input.blindStructureId ?? null,
      blind_structure_snapshot: input.blindStructureSnapshot ?? null,
      prize_pool_total: input.prizePoolTotal,
    })
    .select()
    .single()
  if (error) throw error

  await replaceParticipantsAndResults(data.id, input)
  return (await getEvent(data.id))!
}

export async function updateEvent(id: string, input: EventInput): Promise<Event> {
  const { error } = await supabase
    .from('events')
    .update({
      name: input.name,
      date: new Date(input.date).toISOString(),
      buy_in: input.buyIn,
      rebuy_price: input.rebuyPrice ?? null,
      bounties: input.bounties ?? null,
      mystery_ko: input.mysteryKo ?? null,
      include_bounties_in_net: input.includeBountiesInNet,
      max_players: input.maxPlayers ?? null,
      starting_stack: input.startingStack ?? null,
      status: input.status,
      season_id: input.seasonId ?? null,
      blind_structure_id: input.blindStructureId ?? null,
      blind_structure_snapshot: input.blindStructureSnapshot ?? null,
      prize_pool_total: input.prizePoolTotal,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error

  await replaceParticipantsAndResults(id, input)
  return (await getEvent(id))!
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export async function goLive(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({ status: 'active' as EventStatus, updated_at: new Date().toISOString() })
    .eq('id', eventId)
  if (error) throw error
}

export async function saveLiveResults(
  eventId: string,
  finalResults: EventResult[],
  finalParticipantIds: string[],
  finalPrizePoolTotal: number,
): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({
      status: 'completed' as EventStatus,
      prize_pool_total: finalPrizePoolTotal,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
  if (error) throw error

  await replaceParticipantsAndResults(eventId, {
    participantIds: finalParticipantIds,
    results: finalResults,
  } as EventInput)
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  if (!data) {
    return { theme: 'light', defaultBuyIn: 20, defaultMaxPlayers: 90 }
  }
  return {
    theme: data.theme,
    defaultBuyIn: Number(data.default_buy_in),
    defaultMaxPlayers: data.default_max_players,
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({
      id: 1,
      theme: settings.theme,
      default_buy_in: settings.defaultBuyIn,
      default_max_players: settings.defaultMaxPlayers,
    })
  if (error) throw error
}
