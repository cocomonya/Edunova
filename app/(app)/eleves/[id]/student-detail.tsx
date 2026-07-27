'use client'

import { useState } from 'react'
import StudentEditForm from './student-edit-form'
import StatusActions from './status-actions'

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
  status: string
}

const SEXE_LABELS: Record<string, string> = { M: 'Masculin', F: 'Feminin' }

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-slate-800">{value || '-'}</p>
    </div>
  )
}

export default function StudentDetail({ student }: { student: Student }) {
  const [editing, setEditing] = useState(false)
  const fullName = `${student.first_name} ${student.post_nom ?? ''} ${student.last_name}`.replace(/\s+/g, ' ').trim()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Statut</h2>
        <StatusActions studentId={student.id} studentName={fullName} currentStatus={student.status} />
      </div>

      {editing ? (
        <StudentEditForm student={student} onDone={() => setEditing(false)} />
      ) : (
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Informations
            </h2>
            <button
              onClick={() => setEditing(true)}
              className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-medium"
            >
              Modifier
            </button>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Identite</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prenom" value={student.first_name} />
              <Field label="Post-nom" value={student.post_nom} />
              <Field label="Nom" value={student.last_name} />
              <Field label="Sexe" value={student.sexe ? SEXE_LABELS[student.sexe] : null} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Naissance et adresse</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date de naissance" value={student.date_naissance} />
              <Field label="Lieu de naissance" value={student.lieu_naissance} />
            </div>
            <div className="mt-4">
              <Field label="Adresse" value={student.adresse} />
            </div>
            <div className="mt-4">
              <Field label="N acte de naissance" value={student.acte_naissance_numero} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Tuteur</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nom du tuteur" value={student.guardian_name} />
              <Field label="Telephone tuteur" value={student.guardian_phone} />
            </div>
            <div className="mt-4">
              <Field label="Adresse du tuteur" value={student.guardian_address} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Contact d urgence</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nom" value={student.emergency_contact_name} />
              <Field label="Lien de parente" value={student.emergency_contact_relation} />
            </div>
            <div className="mt-4">
              <Field label="Telephone" value={student.emergency_contact_phone} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
