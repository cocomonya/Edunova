import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('school_id, role_id, roles ( slug )')
    .eq('id', userData.user.id)
    .single()

  const roleSlug = (profile?.roles as any)?.slug as string | undefined

  if (roleSlug === 'enseignant') {
    const { data: assignments } = await supabase
      .from('teacher_assignments')
      .select('id, classes ( id, name, niveau ), subjects ( id, name )')
      .eq('teacher_id', userData.user.id)

    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold text-slate-900 mb-6">Mes classes</h1>
          <div className="space-y-3">
            {assignments?.map((a: any) => (
              <Link
                key={a.id}
                href={`/notes/${a.id}`}
                className="block bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-400"
              >
                <p className="font-medium text-slate-900">{a.subjects?.name}</p>
                <p className="text-sm text-slate-500">{a.classes?.name} ({a.classes?.niveau})</p>
              </Link>
            ))}
            {(!assignments || assignments.length === 0) && (
              <p className="text-slate-400 text-sm">Aucune classe assignee pour le moment.</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (roleSlug === 'parent') {
    const { data: children } = await supabase
      .from('parent_students')
      .select('students ( id, first_name, last_name, matricule )')
      .eq('parent_id', userData.user.id)

    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold text-slate-900 mb-6">Mes enfants</h1>
          <div className="space-y-3">
            {children?.map((c: any) => (
              <Link
                key={c.students?.id}
                href={`/notes/enfant/${c.students?.id}`}
                className="block bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-400"
              >
                <p className="font-medium text-slate-900">
                  {c.students?.first_name} {c.students?.last_name}
                </p>
                <p className="text-sm text-slate-500">{c.students?.matricule}</p>
              </Link>
            ))}
            {(!children || children.length === 0) && (
              <p className="text-slate-400 text-sm">Aucun enfant rattache a votre compte.</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, niveau')
    .eq('school_id', profile?.school_id)
    .order('name')

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">Notes par classe</h1>
        <div className="space-y-3">
          {classes?.map((c) => (
            <Link
              key={c.id}
              href={`/notes/classe/${c.id}`}
              className="block bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-400"
            >
              <p className="font-medium text-slate-900">{c.name}</p>
              <p className="text-sm text-slate-500">{c.niveau}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
