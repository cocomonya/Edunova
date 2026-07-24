import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function AssignmentPage({ params }: { params: Promise<{ assignmentId: string }> }) {
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

  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('id, title, type, date_evaluation, max_score, coefficient')
    .eq('class_id', assignment.class_id)
    .eq('subject_id', assignment.subject_id)
    .order('date_evaluation', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {(assignment.subjects as any)?.name}
            </h1>
            <p className="text-sm text-slate-500">
              {(assignment.classes as any)?.name} ({(assignment.classes as any)?.niveau})
            </p>
          </div>
          <Link
            href={`/notes/${assignmentId}/nouvelle`}
            className="bg-slate-900 text-white text-sm px-4 py-2 rounded font-medium"
          >
            + Evaluation
          </Link>
        </div>

        <div className="space-y-3">
          {evaluations?.map((ev) => (
            <Link
              key={ev.id}
              href={`/notes/evaluation/${ev.id}`}
              className="block bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-400"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">{ev.title}</p>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {ev.type}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Sur {ev.max_score} - Coef {ev.coefficient} - {ev.date_evaluation}
              </p>
            </Link>
          ))}
          {(!evaluations || evaluations.length === 0) && (
            <p className="text-slate-400 text-sm">Aucune evaluation pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}
