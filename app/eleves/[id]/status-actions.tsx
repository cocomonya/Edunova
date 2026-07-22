'use client'

import { useTransition } from 'react'
import { changeStudentStatus } from './actions'

const STATUSES = [
  { value: 'actif', label: 'Actif', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'inactif', label: 'Inactif', color: 'bg-slate-100 text-slate-600 border-slate-300' },
  { value: 'transfere', label: 'Transfere', color: 'bg-amber-50 text-amber-700 border-amber-200' },
] as const

export default function StatusActions({
  studentId,
  currentStatus,
}: {
  studentId: string
  currentStatus: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex gap-2">
      {STATUSES.map((s) => (
        <button
          key={s.value}
          disabled={isPending || currentStatus === s.value}
          onClick={() => startTransition(() => changeStudentStatus(studentId, s.value))}
          className={`text-xs px-3 py-1.5 rounded border font-medium disabled:opacity-40 ${
            currentStatus === s.value ? s.color : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
