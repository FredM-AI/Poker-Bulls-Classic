import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import * as dataService from '@/lib/data-service'
import { useToast } from '@/hooks/use-toast'
import { useInvalidateAll } from '@/hooks/useData'

interface DeleteEventButtonProps {
  eventId: string
  eventName: string
  className?: string
  redirectAfterDelete?: boolean
}

export default function DeleteEventButton({ eventId, eventName, className, redirectAfterDelete }: DeleteEventButtonProps) {
  const [isAlertOpen, setIsAlertOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const invalidateAll = useInvalidateAll()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await dataService.deleteEvent(eventId)
      invalidateAll()
      toast({ title: 'Event Deleted', description: `The event "${eventName}" has been successfully deleted.` })
      if (redirectAfterDelete) navigate('/events')
    } catch (error: any) {
      toast({ title: 'Error Deleting Event', description: error?.message || 'An unexpected error occurred.', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setIsAlertOpen(false)
    }
  }

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className={className} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the event
            <strong className="ml-1 mr-1 text-foreground">"{eventName}"</strong>
            and all of its associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isDeleting ? 'Deleting...' : 'Yes, delete event'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
