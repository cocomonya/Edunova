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
    <form action={formAction} className="space-y-5 bg-white p-6 rounded-lg border border-slate-200">
      {state.error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">
          {state.error}
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Identite
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prenom *</label>
            <input name="first_name" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Post-nom</label>
            <input name="post_nom" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input name="last_name" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sexe</label>
            <select name="sexe" defaultValue="" className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">-- Choisir --</option>
              <option value="M">Masculin</option>
              <option value="F">Feminin</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Scolarite
        </h3>
        <label className="block text-sm font-medium text-slate-700 mb-1">Classe *</label>
        <select name="class_id" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
          <option value="">-- Choisir --</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.niveau})</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Naissance et adresse
        </h3>
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
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
          <input name="adresse" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">N acte de naissance</label>
          <input name="acte_naissance_numero" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Tuteur
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du tuteur</label>
            <input name="guardian_name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telephone tuteur</label>
            <input name="guardian_phone" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Adresse du tuteur</label>
          <input name="guardian_address" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Contact d urgence
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
            <input name="emergency_contact_name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lien de parente</label>
            <input name="emergency_contact_relation" placeholder="Oncle, voisin..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Telephone</label>
          <input name="emergency_contact_phone" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? 'Creation...' : "Creer l'eleve"}
      </button>
    </form>
  )
}
