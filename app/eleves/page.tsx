import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ElevesPage() {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: students } = await supabase
    .from('enrollments')
    .select('id, status, students ( id, matricule, first_name, last_name, status ), classes ( name, niveau )')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Élèves</h1>
          <Link
            href="/eleves/nouveau"
            className="bg-slate-900 text-white text-sm px-4 py-2 rounded font-medium"
          >
            + Nouvel élève
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Matricule</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Nom</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Classe</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((e: any) => (
                <tr key={e.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2 text-slate-500">{e.students?.matricule}</td>
                  <td className="px-4 py-2">
                    <a href={`/eleves/${e.students?.id}`} className="text-slate-900 hover:underline">
                    {e.students?.first_name} {e.students?.last_name}</a>
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {e.classes?.name} ({e.classes?.niveau})
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                      {e.students?.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!students || students.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    Aucun élève enregistré
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
