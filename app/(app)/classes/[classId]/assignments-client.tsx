'use client'

import { useTransition } from 'react'
import { assignTeacher } from './actions'

interface Subject {
  id: string
  name: string
}

interface Teacher {
  id: string
  full_name: string
}

export default function AssignmentsClient({
  classId,
  academicYearId,
  subjects,
  teachers,
  assignmentMap,
}: {
  classId: string
  academicYearId: string
  subjects: Subject[]
  teachers: Teacher[]
  assignmentMap: Record<string, string>
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(subjectId: string, teacherId: string) {
    const formData = new FormData()
    formData.set('class_id', classId)
    formData.set('subject_id', subjectId)
    formData.set('academic_year_id', academicYearId)
    formData.set('teacher_id', teacherId)
    startTransition(() => {
      assignTeacher({}, formData)
    })
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
      {subjects.map((s) => (
        <div key={s.id} className="p-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-900">{s.name}</p>
          <select
            disabled={isPending}
            defaultValue={assignmentMap[s.id] ?? ''}
            onChange={(e) => handleChange(s.id, e.target.value)}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm max-w-[55%]"
          >
            <option value="">-- Aucun --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
        </div>
      ))}
      {subjects.length === 0 && (
        <p className="p-4 text-slate-400 text-sm">Aucune matiere configuree.</p>
      )}
    </div>
  )
}
