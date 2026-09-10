import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Season } from '@/lib/types'
import type { Event } from '@/lib/types'
import type { SeasonInput } from '@/lib/data-service'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CalendarDays, Info, ToggleLeft, ToggleRight, ListChecks, PlusCircle, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SeasonFormProps {
  season?: Season
  allEvents: Event[]
  formTitle: string
  formDescription: string
  submitButtonText: string
  onSubmit: (data: SeasonInput) => Promise<void>
}

function toDateInputValue(iso?: string): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export default function SeasonForm({ season, allEvents, formTitle, formDescription, submitButtonText, onSubmit }: SeasonFormProps) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [name, setName] = React.useState(season?.name || '')
  const [startDate, setStartDate] = React.useState(toDateInputValue(season?.startDate))
  const [endDate, setEndDate] = React.useState(toDateInputValue(season?.endDate))
  const [isActive, setIsActive] = React.useState(season ? season.isActive : true)
  const [associatedEventIds, setAssociatedEventIds] = React.useState<string[]>(
    season ? allEvents.filter((e) => e.seasonId === season.id).map((e) => e.id) : [],
  )
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const availableEvents = allEvents
    .filter((event) => !event.seasonId || event.seasonId === season?.id)
    .filter((event) => !associatedEventIds.includes(event.id))

  const currentAssociatedEventsFull = allEvents.filter((event) => associatedEventIds.includes(event.id))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
        throw new Error('End date must be on or after start date.')
      }
      await onSubmit({
        name,
        startDate,
        endDate: endDate || undefined,
        isActive,
        eventIdsToAssociate: associatedEventIds,
      })
      toast({ title: 'Success!', description: `Season ${season ? 'updated' : 'created'} successfully.` })
      navigate('/seasons')
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{formTitle}</CardTitle>
        <CardDescription>{formDescription}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 border rounded-lg shadow-sm">
            <h3 className="font-headline text-lg flex items-center">
              <Info className="mr-2 h-5 w-5 text-primary" />
              Season Details
            </h3>
            <div className="space-y-2">
              <Label htmlFor="name">Season Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} className="h-9" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                  Start Date
                </Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="h-9" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                  End Date (Optional)
                </Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || undefined} className="h-9" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive" className="flex items-center">
                {isActive ? <ToggleRight className="mr-2 h-5 w-5 text-green-500" /> : <ToggleLeft className="mr-2 h-5 w-5 text-muted-foreground" />}
                Season Status
              </Label>
              <div className="flex items-center space-x-3 p-3 border rounded-md bg-muted/30">
                <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                <span className={isActive ? 'text-green-600 font-medium' : 'text-muted-foreground'}>{isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          {season?.id && (
            <div className="space-y-4 p-4 border rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-headline text-lg flex items-center">
                  <ListChecks className="mr-2 h-5 w-5 text-primary" />
                  Manage Associated Events
                </h3>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/events/new?seasonId=${season.id}`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Event for this Season
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                  <Label>Available Events ({availableEvents.length})</Label>
                  <ScrollArea className="h-60 w-full rounded-md border p-1.5">
                    {availableEvents.length > 0 ? (
                      availableEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-1.5 hover:bg-muted/50 rounded-md text-sm">
                          <span>
                            {event.name} ({new Date(event.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })})
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setAssociatedEventIds((prev) => [...prev, event.id])}
                            title="Add to season"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground p-2 text-sm">No unassigned events available.</p>
                    )}
                  </ScrollArea>
                </div>
                <div>
                  <Label>Events in this Season ({currentAssociatedEventsFull.length})</Label>
                  <ScrollArea className="h-60 w-full rounded-md border p-1.5">
                    {currentAssociatedEventsFull.length > 0 ? (
                      currentAssociatedEventsFull.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-1.5 hover:bg-muted/50 rounded-md text-sm">
                          <span>
                            {event.name} ({new Date(event.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })})
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setAssociatedEventIds((prev) => prev.filter((id) => id !== event.id))}
                            title="Remove from season"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground p-2 text-sm">No events currently in this season.</p>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive mt-2 text-center p-2 bg-destructive/10 rounded-md">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t pt-6">
          <Button variant="outline" asChild>
            <Link to="/seasons">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : submitButtonText}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
