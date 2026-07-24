import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function EnfantNotesPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: student } = await supabase
    .from('students')
    .select('id, first_name, last_name, matricule')
    .eq('id', studentId)
    .single()

  if (!student) notFound()

  const { data: grades } = await supabase
    .from('grades')
    .select('score, evaluations ( title, type, max_score, coefficient, date_evaluation, subjects ( name ) )')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          {student.first_name} {student.last_name}
        </h1>
        <p className="text-sm text-slate-500 mb-6">{student.matricule}</p>

        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {grades?.map((g: any, i: number) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {g.evaluations?.subjects?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {g.evaluations?.title} - {g.evaluations?.date_evaluation}
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {g.score} / {g.evaluations?.max_score}
              </span>
            </div>
          ))}
          {(!grades || grades.length === 0) && (
            <p className="p-4 text-slate-400 text-sm">Aucune note enregistree pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}
