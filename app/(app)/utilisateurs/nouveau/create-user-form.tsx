'use client'

import { useActionState, useEffect, useState } from 'react'
import { createUserAccount, type CreateUserState } from '../actions'

const initialState: CreateUserState = {}

function inputClass(hasError?: boolean) {
  return `w-full border rounded px-3 py-2 text-sm ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'
  } outline-none`
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-600 mt-1">{message}</p>
}

export default function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAccount, initialState)
  const [creatingAnother, setCreatingAnother] = useState(false)
  const [copied, setCopied] = useState(false)
  const fieldErrors = state.fieldErrors ?? {}

  useEffect(() => {
    if (state.success) {
      setCreatingAnother(false)
      setCopied(false)
    }
  }, [state])

  async function handleCopy() {
    if (!state.tempPassword) return
    try {
      await navigator.clipboard.writeText(state.tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard indisponible, l affichage select-all reste utilisable
    }
  }

  if (state.success && state.tempPassword && !creatingAnother) {
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
          <div className="flex gap-2">
            <p className="flex-1 font-mono text-lg bg-slate-50 p-3 rounded border border-slate-200 select-all">
              {state.tempPassword}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 rounded border border-slate-300 text-sm text-slate-600 shrink-0"
            >
              {copied ? 'Copie !' : 'Copier'}
            </button>
          </div>
          <p className="text-xs text-amber-600 mt-2">
            Notez ce mot de passe et transmettez-le a l utilisateur. Il ne sera plus jamais affiche.
            L utilisateur devra le changer a sa premiere connexion.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setCreatingAnother(true)}
            className="flex-1 bg-slate-900 text-white rounded py-2.5 text-sm font-medium"
          >
            Creer un autre compte
          </button>
          <a
            href="/utilisateurs"
            className="flex-1 text-center border border-slate-300 rounded py-2.5 text-sm font-medium text-slate-600"
          >
            Retour a la liste
          </a>
        </div>
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
        <input name="full_name" required className={inputClass(!!fieldErrors.full_name)} />
        <FieldError message={fieldErrors.full_name} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
        <input type="email" name="email" required className={inputClass(!!fieldErrors.email)} />
        <FieldError message={fieldErrors.email} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
        <select name="role_slug" required defaultValue="" className={inputClass(!!fieldErrors.role_slug)}>
          <option value="" disabled>-- Choisir --</option>
          <optgroup label="Personnel">
            <option value="directeur">Directeur</option>
            <option value="secretaire">Secretaire</option>
            <option value="comptable">Comptable</option>
            <option value="enseignant">Enseignant</option>
          </optgroup>
          <optgroup label="Famille">
            <option value="parent">Parent</option>
          </optgroup>
        </select>
        <FieldError message={fieldErrors.role_slug} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 text-white rounded py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? 'Creation...' : 'Creer le compte'}
      </button>
    </form>
  )
}
