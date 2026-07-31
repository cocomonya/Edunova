import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function UtilisateursPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, is_active, roles ( slug, name )')
    .order('created_at', { ascending: false })

  const { data: linkedRows } = await supabase
    .from('parent_students')
    .select('parent_id')

  const linkedParentIds = new Set((linkedRows ?? []).map((r) => r.parent_id))

  const { data: pendingRows } = await supabase
    .from('change_requests')
    .select('target_id')
    .eq('target_type', 'user')
    .eq('status', 'pending')

  const pendingUserIds = new Set((pendingRows ?? []).map((r) => r.target_id))

  const sortByPending = (a: any, b: any) => {
    const aPending = pendingUserIds.has(a.id) ? 0 : 1
    const bPending = pendingUserIds.has(b.id) ? 0 : 1
    return aPending - bPending
  }

  const personnel = (users ?? []).filter((u: any) => u.roles?.slug !== 'parent').sort(sortByPending)
  const parents = (users ?? []).filter((u: any) => u.roles?.slug === 'parent').sort(sortByPending)

  function UserRow(u: any, showLinkBadge: boolean) {
    const isPending = pendingUserIds.has(u.id)
    return (
      <Link key={u.id} href={`/utilisateurs/${u.id}`} className="block p-4 hover:bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
              {u.full_name}
              {isPending && (
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                  En attente
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500">{u.email} - {u.roles?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {showLinkBadge && (
              linkedParentIds.has(u.id) ? (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">Lie</span>
              ) : (
                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">Non lie</span>
              )
            )}
            <span className={`text-xs px-2 py-0.5 rounded ${u.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {u.is_active ? 'Actif' : 'Desactive'}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
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

        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Personnel</h2>
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 mb-6">
          {personnel.map((u: any) => UserRow(u, false))}
          {personnel.length === 0 && (
            <p className="p-4 text-slate-400 text-sm">Aucun membre du personnel.</p>
          )}
        </div>

        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Parents</h2>
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {parents.map((u: any) => UserRow(u, true))}
          {parents.length === 0 && (
            <p className="p-4 text-slate-400 text-sm">Aucun parent.</p>
          )}
        </div>
      </div>
    </div>
  )
}
