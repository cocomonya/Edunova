'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createStudent, type CreateStudentState } from '../actions'

interface ClasseOption {
  id: string
  name: string
  niveau: string
}

const initialState: CreateStudentState = {}

export default function StudentForm({ classes }: { classes: ClasseOption[] }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createStudent, initialState)

  useEffect(() => {
    if (state.success) {
      router.push('/eleves')
    }
  }, [state.success, router])

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg border border-slate-200">
      {state.error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Prénom *</label>
          <input name="first_name" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
          <input name="last_name" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Classe *</label>
        <select name="class_id" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
          <option value="">-- Choisir --</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.niveau})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
          <input type="date" name="date_naissance" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Lieu de naissance</label>
          <input name="lieu_naissance" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
        <input name="adresse" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">N° acte de naissance</label>
        <input name="acte_naissance_numero" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom du tuteur</label>
          <input name="guardian_name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone tuteur</label>
          <input name="guardian_phone" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? 'Création...' : "Créer l'élève"}
      </button>
    </form>
  )
}
