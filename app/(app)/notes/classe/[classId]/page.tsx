import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function ClasseNotesPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: classe } = await supabase
    .from('classes')
    .select('id, name, niveau')
    .eq('id', classId)
    .single()

  if (!classe) notFound()

  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('id, title, type, date_evaluation, max_score, subjects ( name )')
    .eq('class_id', classId)
    .order('date_evaluation', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">{classe.name}</h1>
        <p className="text-sm text-slate-500 mb-6">{classe.niveau}</p>

        <div className="space-y-3">
          {evaluations?.map((ev: any) => (
            <Link
              key={ev.id}
              href={`/notes/evaluation/${ev.id}`}
              className="block bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-400"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">{ev.title}</p>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {ev.subjects?.name}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {ev.type} - Sur {ev.max_score} - {ev.date_evaluation}
              </p>
            </Link>
          ))}
          {(!evaluations || evaluations.length === 0) && (
            <p className="text-slate-400 text-sm">Aucune evaluation pour cette classe.</p>
          )}
        </div>
      </div>
    </div>
  )
}
