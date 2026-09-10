import * as React from 'react'
import type { BlindLevel, BlindStructureTemplate } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlusCircle, Trash2, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { Switch } from './ui/switch'
import { useToast } from '@/hooks/use-toast'
import * as dataService from '@/lib/data-service'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'

interface BlindStructureManagerFormProps {
  structures: BlindStructureTemplate[]
  onApplyStructure?: (levels: BlindLevel[], structureId: string) => void
  onApplied?: () => void
}

const createNewLevel = (lastLevel: number): BlindLevel => ({
  level: lastLevel + 1,
  smallBlind: 0,
  bigBlind: 0,
  ante: 0,
  duration: 20,
  isBreak: false,
})

const BLANK_STRUCTURE_ID = 'new-structure-blank'

export function BlindStructureManagerForm({ structures, onApplyStructure, onApplied }: BlindStructureManagerFormProps) {
  const { toast } = useToast()
  const [availableStructures, setAvailableStructures] = React.useState<BlindStructureTemplate[]>(structures)
  const [selectedStructureId, setSelectedStructureId] = React.useState<string>(structures.length > 0 ? structures[0].id : BLANK_STRUCTURE_ID)
  const [currentLevels, setCurrentLevels] = React.useState<BlindLevel[]>([])
  const [structureName, setStructureName] = React.useState('')
  const [startingStack, setStartingStack] = React.useState('10000')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<{ name?: string; startingStack?: string; levels?: string }>({})

  React.useEffect(() => {
    if (selectedStructureId === BLANK_STRUCTURE_ID) {
      setCurrentLevels([createNewLevel(0)])
      setStructureName('New Custom Structure')
      setStartingStack('10000')
    } else {
      const selected = availableStructures.find((s) => s.id === selectedStructureId)
      if (selected) {
        setCurrentLevels(JSON.parse(JSON.stringify(selected.levels)))
        setStructureName(selected.name)
        setStartingStack(selected.startingStack?.toString() || '10000')
      }
    }
  }, [selectedStructureId, availableStructures])

  const handleLevelChange = (index: number, field: keyof BlindLevel, value: string | number | boolean) => {
    const updatedLevels = [...currentLevels]
    const levelToUpdate = { ...updatedLevels[index] }

    if (field === 'isBreak' && typeof value === 'boolean') {
      levelToUpdate[field] = value
      if (value) {
        levelToUpdate.smallBlind = 0
        levelToUpdate.bigBlind = 0
        levelToUpdate.ante = 0
      }
    } else if (typeof value === 'string') {
      const numValue = parseInt(value, 10)
      ;(levelToUpdate as any)[field] = isNaN(numValue) ? 0 : numValue
    }

    updatedLevels[index] = levelToUpdate
    setCurrentLevels(updatedLevels)
  }

  const addLevel = () => {
    const lastLevel = currentLevels.reduce((max, l) => (!l.isBreak && l.level > max ? l.level : max), 0)
    setCurrentLevels([...currentLevels, createNewLevel(lastLevel)])
  }

  const removeLevel = (index: number) => {
    setCurrentLevels(currentLevels.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: typeof errors = {}
    if (structureName.trim().length < 3) newErrors.name = 'Name must be at least 3 characters.'
    if (currentLevels.length === 0) newErrors.levels = 'A structure must have at least one level.'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSaving(true)
    try {
      const id = selectedStructureId === BLANK_STRUCTURE_ID ? crypto.randomUUID() : selectedStructureId
      const saved = await dataService.saveBlindStructure({
        id,
        name: structureName,
        startingStack: parseInt(startingStack) || undefined,
        levels: currentLevels,
      })
      const updated = await dataService.getBlindStructures()
      setAvailableStructures(updated)
      setSelectedStructureId(saved.id)
      toast({ title: 'Success', description: `Structure "${structureName}" saved successfully.` })
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to save blind structure.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteStructure = async () => {
    if (selectedStructureId === BLANK_STRUCTURE_ID) return
    try {
      await dataService.deleteBlindStructure(selectedStructureId)
      toast({ title: 'Success', description: `Structure "${structureName}" has been deleted.` })
      const updated = await dataService.getBlindStructures()
      setAvailableStructures(updated)
      setSelectedStructureId(updated.length > 0 ? updated[0].id : BLANK_STRUCTURE_ID)
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to delete structure.', variant: 'destructive' })
    }
    setIsDeleteDialogOpen(false)
  }

  const handleApply = () => {
    if (selectedStructureId === BLANK_STRUCTURE_ID || !onApplyStructure) return
    onApplyStructure(currentLevels, selectedStructureId)
    toast({ title: 'Applied', description: `"${structureName}" is now the active structure for this event.` })
    onApplied?.()
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="flex-grow">
              <Label>Load or Edit Structure</Label>
              <Select value={selectedStructureId} onValueChange={setSelectedStructureId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a structure..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BLANK_STRUCTURE_ID}>-- Create New Structure --</SelectItem>
                  {availableStructures.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-grow">
              <Label htmlFor="structureName">Structure Name</Label>
              <Input id="structureName" value={structureName} onChange={(e) => setStructureName(e.target.value)} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div className="flex-grow">
              <Label htmlFor="startingStack">Starting Stack</Label>
              <Input id="startingStack" type="number" value={startingStack} onChange={(e) => setStartingStack(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
              {onApplyStructure && (
                <Button type="button" variant="secondary" onClick={handleApply} disabled={selectedStructureId === BLANK_STRUCTURE_ID}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Apply
                </Button>
              )}
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button" disabled={selectedStructureId === BLANK_STRUCTURE_ID}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the blind structure <strong>"{structureName}"</strong>. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteStructure} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Levels</Label>
            {errors.levels && <p className="text-xs text-destructive">{errors.levels}</p>}
            <ScrollArea className="border rounded-md h-96">
              <Table>
                <TableHeader className="sticky top-0 bg-muted z-10">
                  <TableRow>
                    <TableHead className="w-[80px]">Level</TableHead>
                    <TableHead>Small</TableHead>
                    <TableHead>Big</TableHead>
                    <TableHead>Ante</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="w-[80px]">Break</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLevels.map((level, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input type="text" value={level.isBreak ? 'Break' : level.level} onChange={(e) => handleLevelChange(index, 'level', e.target.value)} disabled={level.isBreak} className="h-8 text-center" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={level.smallBlind} onChange={(e) => handleLevelChange(index, 'smallBlind', e.target.value)} disabled={level.isBreak} className="h-8" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={level.bigBlind} onChange={(e) => handleLevelChange(index, 'bigBlind', e.target.value)} disabled={level.isBreak} className="h-8" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={level.ante || ''} onChange={(e) => handleLevelChange(index, 'ante', e.target.value)} disabled={level.isBreak} className="h-8" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={level.duration} onChange={(e) => handleLevelChange(index, 'duration', e.target.value)} className="h-8" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={level.isBreak} onCheckedChange={(value) => handleLevelChange(index, 'isBreak', value)} />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" type="button" onClick={() => removeLevel(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <div className="flex-shrink-0 mt-2">
              <Button variant="outline" type="button" onClick={addLevel} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Level
              </Button>
            </div>
          </div>
    </form>
  )
}

interface BlindStructureManagerProps {
  isOpen: boolean
  onClose: () => void
  structures: BlindStructureTemplate[]
  activeStructure?: BlindLevel[]
  onApplyStructure: (levels: BlindLevel[], structureId: string) => void
}

export default function BlindStructureManager({ isOpen, onClose, structures, onApplyStructure }: BlindStructureManagerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Blind Structures</DialogTitle>
          <DialogDescription>Create, edit or delete reusable blind structure templates.</DialogDescription>
        </DialogHeader>
        <BlindStructureManagerForm structures={structures} onApplyStructure={onApplyStructure} onApplied={onClose} />
      </DialogContent>
    </Dialog>
  )
}
