'use client'

import { useActionState } from 'react'
import { updateStudent, type UpdateStudentState } from './actions'

interface Student {
  id: string
  first_name: string
  last_name: string
  date_naissance: string | null
  lieu_naissance: string | null
  adresse: string | null
  acte_naissance_numero: string | null
  guardian_name: string | null
  guardian_phone: string | null
}

const initialState: UpdateStudentState = {}

export default function StudentEditForm({ student }: { student: Student }) {
  const [state, formAction, isPending] = useActionState(updateStudent, initialState)

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg border border-slate-200">
      <input type="hidden" name="student_id" value={student.id} />

      {state.error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded border border-green-200">
          Enregistre avec succes
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Prenom *</label>
          <input name="first_name" required defaultValue={student.first_name} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
          <input name="last_name" required defaultValue={student.last_name} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
          <input type="date" name="date_naissance" defaultValue={student.date_naissance ?? ''} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Lieu de naissance</label>
          <input name="lieu_naissance" defaultValue={student.lieu_naissance ?? ''} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
        <input name="adresse" defaultValue={student.adresse ?? ''} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">N acte de naissance</label>
        <input name="acte_naissance_numero" defaultValue={student.acte_naissance_numero ?? ''} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom du tuteur</label>
          <input name="guardian_name" defaultValue={student.guardian_name ?? ''} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Telephone tuteur</label>
          <input name="guardian_phone" defaultValue={student.guardian_phone ?? ''} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </button>
    </form>
  )
}
