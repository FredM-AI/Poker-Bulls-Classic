import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EventCarouselProps {
  seasonEvents: { id: string; name: string }[]
  currentEventId: string
}

export default function EventCarousel({ seasonEvents, currentEventId }: EventCarouselProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [api, setApi] = React.useState<CarouselApi>()

  const currentEventIndex = React.useMemo(() => seasonEvents.findIndex((event) => event.id === currentEventId), [seasonEvents, currentEventId])

  React.useEffect(() => {
    if (!api) return

    const handleSelect = (api: CarouselApi) => {
      const selectedIndex = api!.selectedScrollSnap()
      const newEventId = seasonEvents[selectedIndex]?.id
      if (newEventId && newEventId !== currentEventId && pathname !== `/events/${newEventId}`) {
        navigate(`/events/${newEventId}`)
      }
    }

    api.on('select', handleSelect)
    return () => {
      api.off('select', handleSelect)
    }
  }, [api, navigate, seasonEvents, currentEventId, pathname])

  if (seasonEvents.length <= 1) {
    return null
  }

  return (
    <div className="w-full relative">
      <Carousel setApi={setApi} opts={{ align: 'center', startIndex: currentEventIndex, loop: true }} className="w-full max-w-lg mx-auto">
        <CarouselContent>
          {seasonEvents.map((event, index) => (
            <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Link to={`/events/${event.id}`} className="block">
                  <Card className={cn('transition-all', index === currentEventIndex ? 'border-primary shadow-lg' : 'border-border/50 hover:border-primary/70 hover:shadow-md')}>
                    <CardContent className="flex items-center justify-center p-3">
                      <span className={cn('text-sm font-medium truncate text-center', index === currentEventIndex ? 'text-primary' : 'text-foreground')}>{event.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
