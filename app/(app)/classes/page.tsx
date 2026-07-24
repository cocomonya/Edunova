import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClassesPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: classes } = await supabase
    .from('classes')
    .select('id, niveau, local, users:titulaire_id ( full_name )')
    .order('niveau')

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Classes</h1>
          <Link
            href="/classes/nouvelle"
            className="bg-slate-900 text-white text-sm px-4 py-2 rounded font-medium"
          >
            + Nouvelle classe
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {classes?.map((c: any) => (
            <div key={c.id} className="p-4">
              <p className="text-sm font-medium text-slate-900">
                {c.niveau}{c.local ? ` - Local ${c.local}` : ''}
              </p>
              <p className="text-xs text-slate-500">
                Titulaire : {c.users?.full_name ?? 'Non assigne'}
              </p>
            </div>
          ))}
          {(!classes || classes.length === 0) && (
            <p className="p-4 text-slate-400 text-sm">Aucune classe pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}
