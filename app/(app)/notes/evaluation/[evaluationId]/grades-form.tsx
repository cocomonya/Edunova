'use client'

import { useActionState } from 'react'
import { saveGrades, type SaveGradesState } from '../../actions'

interface StudentRow {
  id: string
  first_name: string
  last_name: string
  matricule: string
  existingScore: number | null
}

const initialState: SaveGradesState = {}

export default function GradesForm({
  evaluationId,
  maxScore,
  students,
}: {
  evaluationId: string
  maxScore: number
  students: StudentRow[]
}) {
  const [state, formAction, isPending] = useActionState(saveGrades, initialState)

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg border border-slate-200">
      <input type="hidden" name="evaluation_id" value={evaluationId} />

      {state.error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded border border-green-200">
          Notes enregistrees
        </div>
      )}

      <div className="space-y-2">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-slate-900">{s.first_name} {s.last_name}</p>
              <p className="text-xs text-slate-400">{s.matricule}</p>
            </div>
            <input
              type="number"
              name={`score_${s.id}`}
              defaultValue={s.existingScore ?? ''}
              min="0"
              max={maxScore}
              step="0.5"
              placeholder="-"
              className="w-20 border border-slate-300 rounded px-2 py-1.5 text-sm text-right"
            />
          </div>
        ))}
        {students.length === 0 && (
          <p className="text-slate-400 text-sm">Aucun eleve dans cette classe.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || students.length === 0}
        className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? 'Enregistrement...' : 'Enregistrer les notes'}
      </button>
    </form>
  )
}
