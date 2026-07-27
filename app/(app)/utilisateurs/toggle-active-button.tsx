'use client'

import { useState, useTransition } from 'react'
import { requestToggleActive } from './actions'

export default function ToggleActiveButton({
  userId,
  userName,
  isActive,
}: {
  userId: string
  userName: string
  isActive: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'pending' | 'error'; text: string } | null>(null)

  function handleClick() {
    setMessage(null)
    startTransition(async () => {
      const result = await requestToggleActive(userId, userName, !isActive)
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
      <button
        disabled={isPending}
        onClick={handleClick}
        className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 disabled:opacity-40"
      >
        {isActive ? 'Desactiver' : 'Reactiver'}
      </button>
      {message && (
        <p
          className={`text-xs mt-1 ${
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
