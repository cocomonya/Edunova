import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EvaluationForm from './evaluation-form'

export default async function NouvelleEvaluationPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: assignment } = await supabase
    .from('teacher_assignments')
    .select('id, class_id, subject_id, academic_year_id, classes ( name, niveau ), subjects ( name )')
    .eq('id', assignmentId)
    .single()

  if (!assignment) notFound()

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Nouvelle evaluation</h1>
        <p className="text-sm text-slate-500 mb-6">
          {(assignment.subjects as any)?.name} - {(assignment.classes as any)?.name}
        </p>
        <EvaluationForm
          classId={assignment.class_id}
          subjectId={assignment.subject_id}
          academicYearId={assignment.academic_year_id}
          assignmentId={assignmentId}
        />
      </div>
    </div>
  )
}
