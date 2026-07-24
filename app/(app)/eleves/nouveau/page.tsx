import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentForm from './student-form'

export default async function NouvelElevePage() {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', userData.user.id)
    .single()

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, niveau')
    .eq('school_id', profile?.school_id)
    .order('name')

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">Nouvel élève</h1>
        <StudentForm classes={classes ?? []} />
      </div>
    </div>
  )
}
