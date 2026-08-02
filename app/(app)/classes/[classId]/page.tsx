import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AssignmentsClient from './assignments-client'

export default async function ClasseDetailPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: classe } = await supabase
    .from('classes')
    .select('id, niveau, local, academic_year_id, school_id, users:titulaire_id ( full_name )')
    .eq('id', classId)
    .single()

  if (!classe) notFound()

  const { data: allSubjects } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('school_id', classe.school_id)
    .eq('is_active', true)
    .order('name')

  const { data: classSubjectsData } = await supabase
    .from('class_subjects')
    .select('id, subject_id, hours_per_week, coefficient, is_optional, subjects ( name )')
    .eq('class_id', classId)
    .eq('academic_year_id', classe.academic_year_id)
    .order('created_at')

  const { data: assignments } = await supabase
    .from('teacher_assignments')
    .select('subject_id, teacher_id')
    .eq('class_id', classId)
    .eq('academic_year_id', classe.academic_year_id)

  const { data: teachers } = await supabase
    .from('users')
    .select('id, full_name, roles!inner ( slug )')
    .eq('school_id', classe.school_id)
    .eq('roles.slug', 'enseignant')
    .eq('is_active', true)

  const teacherBySubject = new Map((assignments ?? []).map((a) => [a.subject_id, a.teacher_id]))

  const classSubjects = (classSubjectsData ?? []).map((cs: any) => ({
    id: cs.id,
    subject_id: cs.subject_id,
    subject_name: cs.subjects?.name ?? 'Matiere inconnue',
    hours_per_week: cs.hours_per_week,
    coefficient: cs.coefficient,
    is_optional: cs.is_optional,
    teacher_id: teacherBySubject.get(cs.subject_id) ?? null,
  }))

  const attachedSubjectIds = new Set(classSubjects.map((cs) => cs.subject_id))
  const availableSubjects = (allSubjects ?? []).filter((s) => !attachedSubjectIds.has(s.id))

  const totalHours = classSubjects.reduce((sum, cs) => sum + (cs.hours_per_week ?? 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          {classe.niveau}{classe.local ? ` - Local ${classe.local}` : ''}
        </h1>
        <p className="text-sm text-slate-500 mb-4">
          Titulaire : {(classe.users as any)?.full_name ?? 'Non assigne'}
        </p>

        <Link
          href={`/eleves?classe=${classId}`}
          className="inline-block mb-6 text-sm bg-slate-900 text-white px-4 py-2 rounded font-medium"
        >
          Voir les eleves de cette classe
        </Link>

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Matieres, volume horaire et enseignants
          </h2>
          <span className="text-xs text-slate-400">{totalHours} h/semaine au total</span>
        </div>
        <AssignmentsClient
          classId={classId}
          academicYearId={classe.academic_year_id}
          classSubjects={classSubjects}
          availableSubjects={availableSubjects}
          teachers={(teachers ?? []).map((t: any) => ({ id: t.id, full_name: t.full_name }))}
        />
      </div>
    </div>
  )
}
