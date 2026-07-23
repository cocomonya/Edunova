import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ToggleActiveButton from './toggle-active-button'

export default async function UtilisateursPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, is_active, roles ( name )')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Utilisateurs</h1>
          <Link
            href="/utilisateurs/nouveau"
            className="bg-slate-900 text-white text-sm px-4 py-2 rounded font-medium"
          >
            + Nouvel utilisateur
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {users?.map((u: any) => (
            <div key={u.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{u.full_name}</p>
                <p className="text-xs text-slate-500">{u.email} - {u.roles?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${u.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {u.is_active ? 'Actif' : 'Desactive'}
                </span>
                <ToggleActiveButton userId={u.id} isActive={u.is_active} />
              </div>
            </div>
          ))}
          {(!users || users.length === 0) && (
            <p className="p-4 text-slate-400 text-sm">Aucun utilisateur.</p>
          )}
        </div>
      </div>
    </div>
  )
}
