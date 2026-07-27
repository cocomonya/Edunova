import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ToggleActiveButton from '../toggle-active-button'
import ResetPasswordButton from '../reset-password-button'

export default async function UtilisateurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name, email, is_active, created_at, roles ( slug, name )')
    .eq('id', id)
    .single()

  if (!user) notFound()

  const roleSlug = (user.roles as any)?.slug as string | undefined

  let assignments: any[] = []
  let children: any[] = []

  if (roleSlug === 'enseignant') {
    const { data } = await supabase
      .from('teacher_assignments')
      .select('id, classes ( niveau, local ), subjects ( name )')
      .eq('teacher_id', id)
    assignments = data ?? []
  }

  if (roleSlug === 'parent') {
    const { data } = await supabase
      .from('parent_students')
      .select('id, students ( first_name, last_name, matricule )')
      .eq('parent_id', id)
    children = data ?? []
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-semibold text-slate-900">{user.full_name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded ${user.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {user.is_active ? 'Actif' : 'Desactive'}
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          {(user.roles as any)?.name} - {user.email}
        </p>

        <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-2 mb-6">
          <ToggleActiveButton userId={user.id} userName={user.full_name} isActive={user.is_active} />
          <ResetPasswordButton userId={user.id} />
        </div>

        {roleSlug === 'enseignant' && (
          <>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Classes assignees
            </h2>
            <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
              {assignments.map((a: any) => (
                <div key={a.id} className="p-4">
                  <p className="text-sm text-slate-900">{a.subjects?.name}</p>
                  <p className="text-xs text-slate-500">
                    {a.classes?.niveau}{a.classes?.local ? ` - Local ${a.classes.local}` : ''}
                  </p>
                </div>
              ))}
              {assignments.length === 0 && (
                <p className="p-4 text-slate-400 text-sm">Aucune classe assignee.</p>
              )}
            </div>
          </>
        )}

        {roleSlug === 'parent' && (
          <>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Enfants rattaches
            </h2>
            <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
              {children.map((c: any) => (
                <div key={c.id} className="p-4">
                  <p className="text-sm text-slate-900">
                    {c.students?.first_name} {c.students?.last_name}
                  </p>
                  <p className="text-xs text-slate-500">{c.students?.matricule}</p>
                </div>
              ))}
              {children.length === 0 && (
                <p className="p-4 text-slate-400 text-sm">Aucun enfant rattache.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
