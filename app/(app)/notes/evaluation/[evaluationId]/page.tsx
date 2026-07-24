import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import GradesForm from './grades-form'

export default async function EvaluationDetailPage({ params }: { params: Promise<{ evaluationId: string }> }) {
  const { evaluationId } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: evaluation } = await supabase
    .from('evaluations')
    .select('id, title, type, max_score, coefficient, class_id, subject_id, classes ( name, niveau ), subjects ( name )')
    .eq('id', evaluationId)
    .single()

  if (!evaluation) notFound()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('students ( id, first_name, last_name, matricule )')
    .eq('class_id', evaluation.class_id)
    .order('created_at', { ascending: true })

  const { data: existingGrades } = await supabase
    .from('grades')
    .select('student_id, score')
    .eq('evaluation_id', evaluationId)

  const gradesMap = new Map((existingGrades ?? []).map((g) => [g.student_id, g.score]))

  const students = (enrollments ?? [])
    .map((e: any) => e.students)
    .filter(Boolean)
    .map((s: any) => ({ ...s, existingScore: gradesMap.get(s.id) ?? null }))

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">{evaluation.title}</h1>
        <p className="text-sm text-slate-500 mb-6">
          {(evaluation.subjects as any)?.name} - {(evaluation.classes as any)?.name} - Sur {evaluation.max_score}
        </p>
        <GradesForm
          evaluationId={evaluationId}
          maxScore={evaluation.max_score}
          students={students}
        />
      </div>
    </div>
  )
}
