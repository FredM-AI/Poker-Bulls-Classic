import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import PlayerForm from './PlayerForm'
import * as dataService from '@/lib/data-service'
import type { PlayerInput } from '@/lib/data-service'
import { usePlayer, useInvalidateAll } from '@/hooks/useData'

export default function PlayerEditPage() {
  const { playerId } = useParams<{ playerId: string }>()
  const { data: player, isLoading } = usePlayer(playerId)
  const invalidateAll = useInvalidateAll()

  const handleSubmit = async (data: PlayerInput) => {
    await dataService.updatePlayer(playerId!, data)
    invalidateAll()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!player) {
    return <p className="text-center py-16 text-muted-foreground">Player not found.</p>
  }

  return (
    <PlayerForm
      player={player}
      formTitle="Edit Player"
      formDescription="Update the player's details."
      submitButtonText="Save Changes"
      onSubmit={handleSubmit}
    />
  )
}
