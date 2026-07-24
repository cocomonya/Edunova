'use client'

import { useTransition } from 'react'
import { toggleUserActive } from './actions'

export default function ToggleActiveButton({
  userId,
  isActive,
}: {
  userId: string
  isActive: boolean
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => { toggleUserActive(userId, !isActive) })}
      className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 disabled:opacity-40"
    >
      {isActive ? 'Desactiver' : 'Reactiver'}
    </button>
  )
}
