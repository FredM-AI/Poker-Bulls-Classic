import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import type { Player } from '@/lib/types'
import type { PlayerInput } from '@/lib/data-service'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, Loader2 } from 'lucide-react'

const PlayerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  nickname: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().optional(),
  avatar: z.union([z.string().url({ message: 'Invalid URL for avatar.' }), z.literal('')]).optional(),
  isActive: z.boolean(),
  isGuest: z.boolean(),
})

type PlayerFormValues = z.infer<typeof PlayerSchema>

interface PlayerFormProps {
  player?: Player
  formTitle: string
  formDescription: string
  submitButtonText: string
  onSubmit: (data: PlayerInput) => Promise<void>
}

export default function PlayerForm({ player, formTitle, formDescription, submitButtonText, onSubmit }: PlayerFormProps) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(PlayerSchema),
    defaultValues: {
      firstName: player?.firstName || '',
      lastName: player?.lastName || '',
      nickname: player?.nickname || '',
      email: player?.email || '',
      phone: player?.phone || '',
      avatar: player?.avatar || '',
      isActive: player ? player.isActive : true,
      isGuest: player ? !!player.isGuest : false,
    },
  })

  const firstName = watch('firstName')
  const lastName = watch('lastName')
  const avatarUrl = watch('avatar')
  const isActive = watch('isActive')
  const isGuest = watch('isGuest')

  const getInitials = () => `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()

  const submit = async (data: PlayerFormValues) => {
    setIsSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        firstName: data.firstName,
        lastName: data.lastName,
        nickname: data.nickname,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        isActive: data.isActive,
        isGuest: data.isGuest,
      })
      toast({ title: 'Success!', description: `Player ${player ? 'updated' : 'created'} successfully.` })
      navigate('/players')
    } catch (error: any) {
      const message = error?.message || 'An unexpected error occurred.'
      setFormError(message)
      toast({ title: 'Save Failed', description: message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">{formTitle}</CardTitle>
        <CardDescription>{formDescription}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(submit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register('firstName')} required />
              {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register('lastName')} required />
              {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="nickname">Nickname (Optional)</Label>
            <Input id="nickname" {...register('nickname')} />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} required />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input id="phone" type="tel" {...register('phone')} />
          </div>

          <div>
            <Label htmlFor="avatar">Avatar URL (Optional)</Label>
            <Input id="avatar" type="url" placeholder="https://example.com/avatar.png" {...register('avatar')} />
            {errors.avatar && <p className="text-sm text-destructive mt-1">{errors.avatar.message}</p>}
          </div>

          <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-28 w-28 border-4 border-background shadow-md">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar preview" />}
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="isGuest" checked={isGuest} onCheckedChange={(v) => setValue('isGuest', v)} />
            <Label htmlFor="isGuest">Guest Player</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="isActive" checked={isActive} onCheckedChange={(v) => setValue('isActive', v)} />
            <Label htmlFor="isActive">Active Player</Label>
          </div>

          {formError && (
            <div className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p>{formError}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link to="/players">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : submitButtonText}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
