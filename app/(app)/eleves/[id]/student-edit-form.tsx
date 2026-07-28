'use client'

import { useActionState } from 'react'
import { requestStudentUpdate, type UpdateStudentState } from './actions'

interface Student {
  id: string
  first_name: string
  post_nom: string | null
  last_name: string
  sexe: string | null
  date_naissance: string | null
  lieu_naissance: string | null
  adresse: string | null
  acte_naissance_numero: string | null
  guardian_name: string | null
  guardian_phone: string | null
  guardian_address: string | null
  emergency_contact_name: string | null
  emergency_contact_relation: string | null
  emergency_contact_phone: string | null
}

const initialState: UpdateStudentState = {}

function inputClass(hasError?: boolean) {
  return `w-full border rounded px-3 py-2 text-sm ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'
  } outline-none`
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-600 mt-1">{message}</p>
}

export default function StudentEditForm({
  student,
  onDone,
}: {
  student: Student
  onDone?: () => void
}) {
  const [state, formAction, isPending] = useActionState(requestStudentUpdate, initialState)
  const fieldErrors = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-5 bg-white p-6 rounded-lg border border-slate-200">
      <input type="hidden" name="student_id" value={student.id} />

      {state.error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">
          {state.error}
        </div>
      )}
      {state.pending && (
        <div className="bg-amber-50 text-amber-700 text-sm p-3 rounded border border-amber-200">
          Demande envoyee au directeur pour approbation.
        </div>
      )}
      {state.success && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded border border-green-200">
          Enregistre avec succes
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Identite</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prenom *</label>
            <input name="first_name" required defaultValue={student.first_name} className={inputClass(!!fieldErrors.first_name)} />
            <FieldError message={fieldErrors.first_name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Post-nom</label>
            <input name="post_nom" defaultValue={student.post_nom ?? ''} className={inputClass(!!fieldErrors.post_nom)} />
            <FieldError message={fieldErrors.post_nom} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input name="last_name" required defaultValue={student.last_name} className={inputClass(!!fieldErrors.last_name)} />
            <FieldError message={fieldErrors.last_name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sexe</label>
            <select name="sexe" defaultValue={student.sexe ?? ''} className={inputClass(!!fieldErrors.sexe)}>
              <option value="">-- Choisir --</option>
              <option value="M">Masculin</option>
              <option value="F">Feminin</option>
            </select>
            <FieldError message={fieldErrors.sexe} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Naissance et adresse</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
            <input type="date" name="date_naissance" defaultValue={student.date_naissance ?? ''} className={inputClass(!!fieldErrors.date_naissance)} />
            <FieldError message={fieldErrors.date_naissance} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lieu de naissance</label>
            <input name="lieu_naissance" defaultValue={student.lieu_naissance ?? ''} className={inputClass(!!fieldErrors.lieu_naissance)} />
            <FieldError message={fieldErrors.lieu_naissance} />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
          <input name="adresse" defaultValue={student.adresse ?? ''} className={inputClass(!!fieldErrors.adresse)} />
          <FieldError message={fieldErrors.adresse} />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">N acte de naissance</label>
          <input name="acte_naissance_numero" defaultValue={student.acte_naissance_numero ?? ''} className={inputClass(!!fieldErrors.acte_naissance_numero)} />
          <FieldError message={fieldErrors.acte_naissance_numero} />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Tuteur</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du tuteur</label>
            <input name="guardian_name" defaultValue={student.guardian_name ?? ''} className={inputClass(!!fieldErrors.guardian_name)} />
            <FieldError message={fieldErrors.guardian_name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telephone tuteur</label>
            <input name="guardian_phone" defaultValue={student.guardian_phone ?? ''} className={inputClass(!!fieldErrors.guardian_phone)} />
            <FieldError message={fieldErrors.guardian_phone} />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Adresse du tuteur</label>
          <input name="guardian_address" defaultValue={student.guardian_address ?? ''} className={inputClass(!!fieldErrors.guardian_address)} />
          <FieldError message={fieldErrors.guardian_address} />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Contact d urgence</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
            <input name="emergency_contact_name" defaultValue={student.emergency_contact_name ?? ''} className={inputClass(!!fieldErrors.emergency_contact_name)} />
            <FieldError message={fieldErrors.emergency_contact_name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lien de parente</label>
            <input name="emergency_contact_relation" defaultValue={student.emergency_contact_relation ?? ''} className={inputClass(!!fieldErrors.emergency_contact_relation)} />
            <FieldError message={fieldErrors.emergency_contact_relation} />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Telephone</label>
          <input name="emergency_contact_phone" defaultValue={student.emergency_contact_phone ?? ''} className={inputClass(!!fieldErrors.emergency_contact_phone)} />
          <FieldError message={fieldErrors.emergency_contact_phone} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-slate-900 text-white rounded py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {isPending ? 'Envoi...' : 'Enregistrer les modifications'}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="px-4 py-2.5 rounded border border-slate-300 text-sm text-slate-600"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
