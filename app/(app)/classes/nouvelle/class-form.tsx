'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClass, type CreateClassState } from '../actions'

const NIVEAUX = [
  '1re primaire', '2e primaire', '3e primaire', '4e primaire',
  '5e primaire', '6e primaire', '7e primaire', '8e primaire',
]

const initialState: CreateClassState = {}

export default function ClassForm({
  academicYearId,
  teachers,
}: {
  academicYearId: string
  teachers: { id: string; full_name: string }[]
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createClass, initialState)

  useEffect(() => {
    if (state.success) {
      router.push('/classes')
    }
  }, [state.success, router])

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg border border-slate-200">
      <input type="hidden" name="academic_year_id" value={academicYearId} />

      {state.error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Niveau *</label>
        <select name="niveau" required defaultValue="" className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
          <option value="" disabled>-- Choisir --</option>
          {NIVEAUX.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Local (optionnel)</label>
        <input name="local" placeholder="A" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        <p className="text-xs text-slate-400 mt-1">Ex: A, B, C - pour distinguer plusieurs classes du meme niveau</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Titulaire (optionnel)</label>
        <select name="titulaire_id" defaultValue="" className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
          <option value="">-- Aucun --</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.full_name}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? 'Creation...' : 'Creer la classe'}
      </button>
    </form>
  )
}
