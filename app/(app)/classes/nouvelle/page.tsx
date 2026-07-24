import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClassForm from './class-form'

export default async function NouvelleClassePage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', userData.user.id)
    .single()

  const { data: academicYear } = await supabase
    .from('academic_years')
    .select('id, label')
    .eq('school_id', profile?.school_id)
    .eq('is_current', true)
    .single()

  const { data: teachers } = await supabase
    .from('users')
    .select('id, full_name, roles!inner ( slug )')
    .eq('school_id', profile?.school_id)
    .eq('roles.slug', 'enseignant')
    .eq('is_active', true)

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Nouvelle classe</h1>
        <p className="text-sm text-slate-500 mb-6">Annee scolaire {academicYear?.label ?? '-'}</p>
        <ClassForm
          academicYearId={academicYear?.id ?? ''}
          teachers={(teachers ?? []).map((t: any) => ({ id: t.id, full_name: t.full_name }))}
        />
      </div>
    </div>
  )
}
