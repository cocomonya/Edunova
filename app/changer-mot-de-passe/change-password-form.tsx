'use client'

import { useActionState } from 'react'
import { changePassword, type ChangePasswordState } from './actions'

const initialState: ChangePasswordState = {}

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, initialState)

  if (state.success) {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 text-center">
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded border border-green-200">
          Votre mot de passe a ete mis a jour.
        </div>
        <a
          href="/connexion"
          className="block bg-slate-900 text-white rounded py-2 text-sm font-medium"
        >
          Retour a la page de connexion
        </a>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg border border-slate-200">
      {state.error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe *</label>
        <input type="password" name="password" required minLength={8} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer le mot de passe *</label>
        <input type="password" name="confirm" required minLength={8} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? 'Enregistrement...' : 'Changer le mot de passe'}
      </button>
    </form>
  )
}
