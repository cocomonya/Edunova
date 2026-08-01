import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SubjectRow from './subject-row'
import CreateSubjectForm from './create-subject-form'

export default async function MatieresPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, code, is_active')
    .order('is_active', { ascending: false })
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Matieres</h1>
        </div>

        <div className="mb-4">
          <CreateSubjectForm />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {subjects?.map((s: any) => (
            <SubjectRow key={s.id} subject={s} />
          ))}
          {(!subjects || subjects.length === 0) && (
            <p className="p-4 text-slate-400 text-sm">Aucune matiere pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}
