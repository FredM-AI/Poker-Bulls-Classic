import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { PlayCircle, Loader2 } from 'lucide-react'
import * as dataService from '@/lib/data-service'
import { useInvalidateAll } from '@/hooks/useData'

export default function GoLiveButton({ eventId, currentStatus }: { eventId: string; currentStatus: string }) {
  const [isPending, setIsPending] = React.useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const invalidateAll = useInvalidateAll()

  const handleGoLive = async () => {
    setIsPending(true)
    try {
      await dataService.goLive(eventId)
      invalidateAll()
      toast({ title: 'Success', description: 'Event is now live!' })
      navigate(`/events/${eventId}/live`)
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Could not update event status.', variant: 'destructive' })
    } finally {
      setIsPending(false)
    }
  }

  if (currentStatus !== 'draft') {
    return null
  }

  return (
    <Button onClick={handleGoLive} disabled={isPending} size="sm" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
      {isPending ? 'Going Live...' : 'Go Live'}
    </Button>
  )
}
