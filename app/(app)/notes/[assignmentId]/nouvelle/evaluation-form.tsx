'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createEvaluation, type EvaluationState } from '../../actions'

const initialState: EvaluationState = {}

export default function EvaluationForm({
  classId,
  subjectId,
  academicYearId,
  assignmentId,
}: {
  classId: string
  subjectId: string
  academicYearId: string
  assignmentId: string
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createEvaluation, initialState)

  useEffect(() => {
    if (state.success) {
      router.push(`/notes/${assignmentId}`)
    }
  }, [state.success, assignmentId, router])

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg border border-slate-200">
      <input type="hidden" name="class_id" value={classId} />
      <input type="hidden" name="subject_id" value={subjectId} />
      <input type="hidden" name="academic_year_id" value={academicYearId} />

      {state.error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
        <input name="title" required placeholder="Interrogation 1 - Chapitre 3" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
        <select name="type" required defaultValue="devoir" className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
          <option value="interrogation">Interrogation</option>
          <option value="devoir">Devoir</option>
          <option value="examen">Examen</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Note sur *</label>
          <input type="number" name="max_score" required defaultValue={20} min="1" step="0.5" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Coefficient *</label>
          <input type="number" name="coefficient" required defaultValue={1} min="0.5" step="0.5" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? 'Creation...' : "Creer l'evaluation"}
      </button>
    </form>
  )
}
