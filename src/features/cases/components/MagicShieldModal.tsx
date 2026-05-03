'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  matches: string[]
  onEdit: () => void
  onProceed: () => void
}

export function MagicShieldModal({ open, matches, onEdit, onProceed }: Props) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <div className="text-4xl mb-2">&#x1F6E1;&#xFE0F;</div>
          <DialogTitle>Magic Shield Alert</DialogTitle>
          <DialogDescription>
            We detected potential personal information that could reveal your identity to lawyers.
          </DialogDescription>
        </DialogHeader>
        {matches.length > 0 && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-xs font-semibold text-red-700 mb-2">Detected items:</p>
            <div className="flex flex-wrap gap-1.5">
              {matches.map((m, i) => (
                <span key={i} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-mono">{m}</span>
              ))}
            </div>
          </div>
        )}
        <p className="text-sm text-slate-600">
          We strongly recommend removing personal details to protect your anonymity. Our AI will also review the case, but client-side protection is your first line of defense.
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={onEdit} className="w-full">Edit My Description</Button>
          <Button variant="outline" onClick={onProceed} className="w-full text-slate-500">Proceed anyway (AI will review)</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
