'use client'

import { useState, useTransition } from 'react'
import { linkParent, unlinkParent } from './actions'

interface LinkedParent {
  id: string
  parent_id: string
  full_name: string
}

interface AvailableParent {
  id: string
  full_name: string
}

export default function ParentsClient({
  studentId,
  linkedParents,
  availableParents,
}: {
  studentId: string
  linkedParents: LinkedParent[]
  availableParents: AvailableParent[]
}) {
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState('')

  function handleAdd() {
    if (!selected) return
    startTransition(() => {
      linkParent(studentId, selected)
    })
    setSelected('')
  }

  function handleRemove(linkId: string) {
    startTransition(() => {
      unlinkParent(linkId, studentId)
    })
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="space-y-2 mb-3">
        {linkedParents.map((p) => (
          <div key={p.id} className="flex items-center justify-between">
            <p className="text-sm text-slate-900">{p.full_name}</p>
            <button
              disabled={isPending}
              onClick={() => handleRemove(p.id)}
              className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 disabled:opacity-40"
            >
              Detacher
            </button>
          </div>
        ))}
        {linkedParents.length === 0 && (
          <p className="text-sm text-slate-400">Aucun parent rattache.</p>
        )}
      </div>

      {availableParents.length > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm"
          >
            <option value="">-- Choisir un parent --</option>
            {availableParents.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
          <button
            disabled={isPending || !selected}
            onClick={handleAdd}
            className="text-xs px-3 py-1.5 rounded bg-slate-900 text-white disabled:opacity-40"
          >
            Rattacher
          </button>
        </div>
      )}
    </div>
  )
}
