'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createSubject, type SubjectFormState } from './actions'

const initialState: SubjectFormState = {}

function inputClass(hasError?: boolean) {
  return `border rounded px-3 py-2 text-sm ${
    hasError ? 'border-red-400' : 'border-slate-300'
  } outline-none`
}

export default function CreateSubjectForm() {
  const [state, formAction, isPending] = useActionState(createSubject, initialState)
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const fieldErrors = state.fieldErrors ?? {}

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      setOpen(false)
    }
  }, [state])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-slate-900 text-white text-sm px-4 py-2 rounded font-medium"
      >
        + Nouvelle matiere
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 mb-4"
    >
      {state.error && (
        <div className="bg-red-50 text-red-700 text-xs p-2 rounded border border-red-200">
          {state.error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">Nom *</label>
          <input name="name" required className={`w-full ${inputClass(!!fieldErrors.name)}`} placeholder="Mathematiques" />
          {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
        </div>
        <div className="w-full sm:w-28">
          <label className="block text-xs font-medium text-slate-600 mb-1">Code</label>
          <input name="code" className={`w-full ${inputClass(!!fieldErrors.code)}`} placeholder="MATH" />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded font-medium disabled:opacity-50"
        >
          {isPending ? 'Creation...' : 'Creer'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-slate-300 text-slate-600 text-sm px-4 py-2 rounded font-medium"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
