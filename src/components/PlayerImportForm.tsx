import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadCloud, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import * as dataService from '@/lib/data-service'
import { useInvalidateAll } from '@/hooks/useData'

export default function PlayerImportForm() {
  const [fileContent, setFileContent] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState('')
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<{ successCount: number; skippedCount: number } | null>(null)
  const invalidateAll = useInvalidateAll()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setResult(null)
    setError(null)
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => setFileContent(e.target?.result as string)
      reader.onerror = () => {
        setFileContent(null)
        setFileName('')
      }
      reader.readAsText(file)
    } else {
      setFileContent(null)
      setFileName('')
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!fileContent) return

    setIsPending(true)
    setError(null)
    setResult(null)
    try {
      const parsed = JSON.parse(fileContent)
      if (!Array.isArray(parsed)) throw new Error('JSON must be an array of players.')
      const importResult = await dataService.importPlayers(parsed)
      invalidateAll()
      setResult(importResult)
    } catch (e: any) {
      setError(e?.message || 'Invalid JSON format. Could not parse the file.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <UploadCloud className="mr-2 h-5 w-5 text-primary" />
          Import Players from JSON
        </CardTitle>
        <CardDescription>
          Select a JSON file containing an array of players to import them into the database. Players with existing
          IDs or emails will be skipped.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="jsonFile">JSON File</Label>
            <Input
              id="jsonFile"
              name="jsonFile"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              required
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {fileName && <p className="mt-1 text-xs text-muted-foreground">Selected: {fileName}</p>}
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {result && (
            <div
              className={`text-sm p-2 rounded-md flex items-start gap-2 ${
                result.successCount > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {result.successCount > 0 ? (
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              )}
              <p>
                Import completed. {result.successCount} players imported successfully. {result.skippedCount} players
                skipped (already exist by ID or email).
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!fileContent || isPending} className="w-full">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isPending ? 'Importing...' : 'Import Players'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
