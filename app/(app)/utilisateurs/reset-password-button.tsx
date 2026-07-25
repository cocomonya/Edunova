'use client'

import { useState, useTransition } from 'react'
import { resetUserPassword } from './actions'

export default function ResetPasswordButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ tempPassword?: string; error?: string } | null>(null)

  function handleReset() {
    setResult(null)
    startTransition(async () => {
      const res = await resetUserPassword(userId)
      setResult(res)
    })
  }

  if (result?.tempPassword) {
    return (
      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-xs">
        <p className="text-amber-700 mb-1">Nouveau mot de passe temporaire :</p>
        <p className="font-mono text-sm bg-white p-2 rounded border border-amber-200 select-all">
          {result.tempPassword}
        </p>
        <button onClick={() => setResult(null)} className="mt-2 text-amber-600 underline">
          Fermer
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        disabled={isPending}
        onClick={handleReset}
        className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 disabled:opacity-40"
      >
        {isPending ? '...' : 'Reinitialiser mdp'}
      </button>
      {result?.error && (
        <p className="text-xs text-red-600 mt-1">{result.error}</p>
      )}
    </div>
  )
}
