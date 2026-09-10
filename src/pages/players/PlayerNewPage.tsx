import PlayerForm from './PlayerForm'
import * as dataService from '@/lib/data-service'
import type { PlayerInput } from '@/lib/data-service'
import { useInvalidateAll } from '@/hooks/useData'

export default function PlayerNewPage() {
  const invalidateAll = useInvalidateAll()

  const handleSubmit = async (data: PlayerInput) => {
    await dataService.createPlayer(data)
    invalidateAll()
  }

  return (
    <PlayerForm
      formTitle="Add New Player"
      formDescription="Enter the details for the new player."
      submitButtonText="Create Player"
      onSubmit={handleSubmit}
    />
  )
}
