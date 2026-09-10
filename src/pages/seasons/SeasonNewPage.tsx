import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import SeasonForm from './SeasonForm'
import * as dataService from '@/lib/data-service'
import type { SeasonInput } from '@/lib/data-service'
import { useEvents, useInvalidateAll } from '@/hooks/useData'

export default function SeasonNewPage() {
  const { data: allEvents } = useEvents()
  const invalidateAll = useInvalidateAll()

  const handleSubmit = async (data: SeasonInput) => {
    await dataService.createSeason(data)
    invalidateAll()
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link to="/seasons">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Seasons
        </Link>
      </Button>
      <SeasonForm
        allEvents={allEvents ?? []}
        formTitle="Create New Season"
        formDescription="Define a new poker season and its parameters."
        submitButtonText="Create Season"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
