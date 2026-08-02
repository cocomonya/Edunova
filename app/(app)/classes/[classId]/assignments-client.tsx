'use client'

import { useState, useTransition } from 'react'
import { assignTeacher, addClassSubject, updateClassSubject, removeClassSubject } from './actions'

interface Teacher {
  id: string
  full_name: string
}

interface Subject {
  id: string
  name: string
}

interface ClassSubjectRow {
  id: string
  subject_id: string
  subject_name: string
  hours_per_week: number
  coefficient: number
  is_optional: boolean
  teacher_id: string | null
}

function ClassSubjectItem({
  row,
  classId,
  academicYearId,
  teachers,
}: {
  row: ClassSubjectRow
  classId: string
  academicYearId: string
  teachers: Teacher[]
}) {
  const [editing, setEditing] = useState(false)
  const [hours, setHours] = useState(row.hours_per_week)
  const [coefficient, setCoefficient] = useState(row.coefficient)
  const [isOptional, setIsOptional] = useState(row.is_optional)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleTeacherChange(teacherId: string) {
    const formData = new FormData()
    formData.set('class_id', classId)
    formData.set('subject_id', row.subject_id)
    formData.set('academic_year_id', academicYearId)
    formData.set('teacher_id', teacherId)
    startTransition(() => {
      assignTeacher({}, formData)
    })
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateClassSubject(row.id, hours, coefficient, isOptional)
      if (result.error) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  function handleRemove() {
    if (!confirm(`Retirer ${row.subject_name} de cette classe ? L affectation enseignant associee sera aussi retiree.`)) return
    startTransition(() => {
      removeClassSubject(row.id)
    })
  }

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-900">
          {row.subject_name}
          {row.is_optional && <span className="text-xs text-slate-400 ml-2">(optionnelle)</span>}
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setEditing(!editing)} className="text-xs border border-slate-300 text-slate-600 px-2 py-1 rounded">
            {editing ? 'Fermer' : 'Modifier'}
          </button>
          <button onClick={handleRemove} disabled={isPending} className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded">
            Retirer
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-2 bg-slate-50 p-3 rounded">
          <div className="flex gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Heures/semaine</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-24 border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Coefficient</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={coefficient}
                onChange={(e) => setCoefficient(Number(e.target.value))}
                className="w-24 border border-slate-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={isOptional} onChange={(e) => setIsOptional(e.target.checked)} />
            Matiere optionnelle
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-medium disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          {row.hours_per_week} h/semaine - coefficient {row.coefficient}
        </p>
      )}

      <select
        disabled={isPending}
        defaultValue={row.teacher_id ?? ''}
        onChange={(e) => handleTeacherChange(e.target.value)}
        className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
      >
        <option value="">-- Aucun enseignant --</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.full_name}</option>
        ))}
      </select>
    </div>
  )
}

function AddSubjectForm({
  classId,
  academicYearId,
  availableSubjects,
}: {
  classId: string
  academicYearId: string
  availableSubjects: Subject[]
}) {
  const [open, setOpen] = useState(false)
  const [subjectId, setSubjectId] = useState('')
  const [hours, setHours] = useState(0)
  const [coefficient, setCoefficient] = useState(1)
  const [isOptional, setIsOptional] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!subjectId) {
      setError('Choisissez une matiere.')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await addClassSubject(classId, subjectId, academicYearId, hours, coefficient, isOptional)
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setSubjectId('')
        setHours(0)
        setCoefficient(1)
        setIsOptional(false)
      }
    })
  }

  if (availableSubjects.length === 0 && !open) {
    return <p className="p-4 text-xs text-slate-400">Toutes les matieres actives sont deja rattachees.</p>
  }

  if (!open) {
    return (
      <div className="p-4">
        <button onClick={() => setOpen(true)} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-medium">
          + Ajouter une matiere
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2 bg-slate-50">
      <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm">
        <option value="">-- Choisir une matiere --</option>
        {availableSubjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <div className="flex gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Heures/semaine</label>
          <input type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-24 border border-slate-300 rounded px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Coefficient</label>
          <input type="number" min="0" step="0.5" value={coefficient} onChange={(e) => setCoefficient(Number(e.target.value))} className="w-24 border border-slate-300 rounded px-2 py-1.5 text-sm" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={isOptional} onChange={(e) => setIsOptional(e.target.checked)} />
        Matiere optionnelle
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleAdd} disabled={isPending} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-medium disabled:opacity-50">
          Ajouter
        </button>
        <button onClick={() => setOpen(false)} className="text-xs border border-slate-300 text-slate-600 px-3 py-1.5 rounded font-medium">
          Annuler
        </button>
      </div>
    </div>
  )
}

export default function AssignmentsClient({
  classId,
  academicYearId,
  classSubjects,
  availableSubjects,
  teachers,
}: {
  classId: string
  academicYearId: string
  classSubjects: ClassSubjectRow[]
  availableSubjects: Subject[]
  teachers: Teacher[]
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
      {classSubjects.map((row) => (
        <ClassSubjectItem key={row.id} row={row} classId={classId} academicYearId={academicYearId} teachers={teachers} />
      ))}
      {classSubjects.length === 0 && (
        <p className="p-4 text-slate-400 text-sm">Aucune matiere rattachee a cette classe.</p>
      )}
      <AddSubjectForm classId={classId} academicYearId={academicYearId} availableSubjects={availableSubjects} />
    </div>
  )
}
