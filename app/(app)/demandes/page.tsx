import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RequestActions from './request-actions'

export default async function DemandesPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('roles ( slug )')
    .eq('id', userData.user.id)
    .single()

  if ((profile?.roles as any)?.slug !== 'directeur') {
    redirect('/tableau-de-bord')
  }

  const { data: pending } = await supabase
    .from('change_requests')
    .select('id, target_type, action_type, target_label, reason, created_at, requested_by, users:requested_by ( full_name )')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const { data: history } = await supabase
    .from('change_requests')
    .select('id, target_type, action_type, target_label, status, resolved_at, users:requested_by ( full_name )')
    .neq('status', 'pending')
    .order('resolved_at', { ascending: false })
    .limit(20)

  const targetTypeLabel = (t: string) => (t === 'student' ? 'Eleve' : 'Utilisateur')
  const actionTypeLabel = (a: string) => (a === 'delete' ? 'Suppression' : 'Modification')

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">Demandes en attente</h1>

        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 mb-8">
          {(pending ?? []).map((r: any) => (
            <div key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {actionTypeLabel(r.action_type)} - {targetTypeLabel(r.target_type)}
                  </p>
                  <p className="text-sm text-slate-700 mt-0.5">{r.target_label}</p>
                  {r.reason && (
                    <p className="text-xs text-slate-500 mt-1">Motif : {r.reason}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Demande par {r.users?.full_name ?? 'Inconnu'} le{' '}
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <RequestActions requestId={r.id} />
              </div>
            </div>
          ))}
          {(pending ?? []).length === 0 && (
            <p className="p-4 text-slate-400 text-sm">Aucune demande en attente.</p>
          )}
        </div>

        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Historique recent
        </h2>
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {(history ?? []).map((r: any) => (
            <div key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-900">
                  {actionTypeLabel(r.action_type)} - {targetTypeLabel(r.target_type)} - {r.target_label}
                </p>
                <p className="text-xs text-slate-400">
                  Par {r.users?.full_name ?? 'Inconnu'} -{' '}
                  {r.resolved_at ? new Date(r.resolved_at).toLocaleDateString('fr-FR') : ''}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  r.status === 'approved'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {r.status === 'approved' ? 'Approuvee' : 'Rejetee'}
              </span>
            </div>
          ))}
          {(history ?? []).length === 0 && (
            <p className="p-4 text-slate-400 text-sm">Aucun historique.</p>
          )}
        </div>
      </div>
    </div>
  )
}
