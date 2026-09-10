import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as dataService from '@/lib/data-service'

export function usePlayers() {
  return useQuery({ queryKey: ['players'], queryFn: dataService.getPlayers })
}

export function usePlayer(id: string | undefined) {
  return useQuery({
    queryKey: ['players', id],
    queryFn: () => dataService.getPlayer(id!),
    enabled: !!id,
  })
}

export function useEvents() {
  return useQuery({ queryKey: ['events'], queryFn: dataService.getEvents })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => dataService.getEvent(id!),
    enabled: !!id,
  })
}

export function useSeasons() {
  return useQuery({ queryKey: ['seasons'], queryFn: dataService.getSeasons })
}

export function useSeason(id: string | undefined) {
  return useQuery({
    queryKey: ['seasons', id],
    queryFn: () => dataService.getSeason(id!),
    enabled: !!id,
  })
}

export function useBlindStructures() {
  return useQuery({ queryKey: ['blindStructures'], queryFn: dataService.getBlindStructures })
}

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: dataService.getSettings })
}

export function useInvalidateAll() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['players'] })
    queryClient.invalidateQueries({ queryKey: ['events'] })
    queryClient.invalidateQueries({ queryKey: ['seasons'] })
    queryClient.invalidateQueries({ queryKey: ['blindStructures'] })
    queryClient.invalidateQueries({ queryKey: ['settings'] })
  }
}
