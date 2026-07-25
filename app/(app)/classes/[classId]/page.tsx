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

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('school_id', classe.school_id)
    .order('name')

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

  const assignmentMap = new Map((assignments ?? []).map((a) => [a.subject_id, a.teacher_id]))

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          {classe.niveau}{classe.local ? ` - Local ${classe.local}` : ''}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Titulaire : {(classe.users as any)?.full_name ?? 'Non assigne'}
        </p>

        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Enseignants par matiere
        </h2>
        <AssignmentsClient
          classId={classId}
          academicYearId={classe.academic_year_id}
          subjects={subjects ?? []}
          teachers={(teachers ?? []).map((t: any) => ({ id: t.id, full_name: t.full_name }))}
          assignmentMap={Object.fromEntries(assignmentMap)}
        />
      </div>
    </div>
  )
}
