'use client'

import { useActionState } from 'react'
import { createUserAccount, type CreateUserState } from '../actions'

const ROLES = [
  { value: 'directeur', label: 'Directeur' },
  { value: 'secretaire', label: 'Secretaire' },
  { value: 'comptable', label: 'Comptable' },
  { value: 'enseignant', label: 'Enseignant' },
  { value: 'parent', label: 'Parent' },
]

const initialState: CreateUserState = {}

export default function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAccount, initialState)

  if (state.success && state.tempPassword) {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded border border-green-200">
          Compte cree avec succes
        </div>
        <div>
          <p className="text-sm text-slate-500 mb-1">Email</p>
          <p className="font-mono text-sm bg-slate-50 p-2 rounded border border-slate-200">{state.email}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 mb-1">Mot de passe temporaire</p>
          <p className="font-mono text-lg bg-slate-50 p-3 rounded border border-slate-200 select-all">
            {state.tempPassword}
          </p>
          <p className="text-xs text-amber-600 mt-2">
            Notez ce mot de passe et transmettez-le a l utilisateur. Il ne sera plus jamais affiche.
            L utilisateur devra le changer a sa premiere connexion.
          </p>
        </div>
        <a
          href="/utilisateurs"
          className="block text-center bg-slate-900 text-white rounded py-2 text-sm font-medium"
        >
          Retour a la liste
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
        <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet *</label>
        <input name="full_name" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
        <input type="email" name="email" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
        <select name="role_slug" required defaultValue="" className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
          <option value="" disabled>-- Choisir --</option>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? 'Creation...' : 'Creer le compte'}
      </button>
    </form>
  )
}
