'use client'

import { useState, useTransition } from 'react'
import { resolveChange } from './actions'

export default function RequestActions({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function handle(decision: 'approved' | 'rejected') {
    setError(null)
    startTransition(async () => {
      const result = await resolveChange(requestId, decision)
      if (result.error) {
        setError(result.error)
      } else {
        setDone(true)
      }
    })
  }

  if (done) {
    return <span className="text-xs text-slate-400">Traitee</span>
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="flex gap-2">
        <button
          onClick={() => handle('approved')}
          disabled={isPending}
          className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded font-medium disabled:opacity-50"
        >
          Approuver
        </button>
        <button
          onClick={() => handle('rejected')}
          disabled={isPending}
          className="bg-white text-slate-700 border border-slate-200 text-xs px-3 py-1.5 rounded font-medium disabled:opacity-50"
        >
          Rejeter
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
