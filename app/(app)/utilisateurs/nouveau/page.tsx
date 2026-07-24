import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateUserForm from './create-user-form'

export default async function NouvelUtilisateurPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">Nouvel utilisateur</h1>
        <CreateUserForm />
      </div>
    </div>
  )
}
