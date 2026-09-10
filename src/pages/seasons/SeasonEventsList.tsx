import { Link } from 'react-router-dom'
import type { Event } from '@/lib/types'
import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const statusVariant: Record<Event['status'], string> = {
  draft: 'bg-yellow-500',
  active: 'bg-green-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500',
}

export default function SeasonEventsList({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No events scheduled for this season yet.</p>
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <Link
          key={event.id}
          to={`/events/${event.id}`}
          className="flex items-center justify-between gap-3 p-3 rounded-md border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${statusVariant[event.status]}`} />
            <div>
              <p className="font-medium">{event.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {format(new Date(event.date), 'PPP')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="capitalize">
              {event.status}
            </Badge>
            <span className="text-sm text-muted-foreground">€{event.buyIn}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
