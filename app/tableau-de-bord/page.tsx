import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function TableauDeBordPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role_id, roles(name), schools(name)')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Tableau de bord</h1>
        <p className="text-sm text-slate-500 mb-6">
          Connecté en tant que {profile?.full_name ?? user.email}
        </p>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-sm text-slate-600">
          Ceci confirme que l&apos;authentification, le middleware et la lecture RLS
          fonctionnent de bout en bout.
        </div>
      </div>
    </div>
  )
}
