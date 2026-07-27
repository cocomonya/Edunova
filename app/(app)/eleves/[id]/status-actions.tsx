'use client'

import { useState, useTransition } from 'react'
import { requestStudentStatusChange } from './actions'

const STATUSES = [
  { value: 'actif', label: 'Actif', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'archive', label: 'Archive', color: 'bg-slate-100 text-slate-600 border-slate-300' },
  { value: 'transfere', label: 'Transfere', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'diplome', label: 'Diplome', color: 'bg-blue-50 text-blue-700 border-blue-200' },
] as const

export default function StatusActions({
  studentId,
  studentName,
  currentStatus,
}: {
  studentId: string
  studentName: string
  currentStatus: string
}) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'pending' | 'error'; text: string } | null>(null)

  function handleClick(status: (typeof STATUSES)[number]['value']) {
    setMessage(null)
    startTransition(async () => {
      const result = await requestStudentStatusChange(studentId, studentName, status)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else if (result.pending) {
        setMessage({ type: 'pending', text: 'Demande envoyee au directeur pour approbation.' })
      } else {
        setMessage({ type: 'success', text: 'Statut mis a jour.' })
      }
    })
  }

  return (
    <div>
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            disabled={isPending || currentStatus === s.value}
            onClick={() => handleClick(s.value)}
            className={`text-xs px-3 py-1.5 rounded border font-medium disabled:opacity-40 ${
              currentStatus === s.value ? s.color : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {message && (
        <p
          className={`text-xs mt-2 ${
            message.type === 'error'
              ? 'text-red-600'
              : message.type === 'pending'
              ? 'text-amber-600'
              : 'text-green-700'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
