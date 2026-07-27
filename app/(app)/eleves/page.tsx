import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClassFilter from './class-filter'

const STATUS_LABELS: Record<string, string> = {
  actif: 'Actif',
  archive: 'Archive',
  transfere: 'Transfere',
  diplome: 'Diplome',
}

const STATUS_COLORS: Record<string, string> = {
  actif: 'bg-green-50 text-green-700',
  archive: 'bg-slate-100 text-slate-600',
  transfere: 'bg-amber-50 text-amber-700',
  diplome: 'bg-blue-50 text-blue-700',
}

export default async function ElevesPage({
  searchParams,
}: {
  searchParams: Promise<{ classe?: string }>
}) {
  const { classe } = await searchParams
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', userData.user.id)
    .single()

  const { data: classes } = await supabase
    .from('classes')
    .select('id, niveau, local')
    .eq('school_id', profile?.school_id)
    .order('niveau')

  let query = supabase
    .from('enrollments')
    .select(`
      id,
      class_id,
      students ( id, matricule, first_name, last_name, status ),
      classes ( name, niveau )
    `)
    .order('created_at', { ascending: true })

  if (classe) {
    query = query.eq('class_id', classe)
  }

  const { data: enrollments } = await query

  const { data: linkedRows } = await supabase
    .from('parent_students')
    .select('student_id')

  const linkedStudentIds = new Set((linkedRows ?? []).map((r) => r.student_id))

  const { data: pendingRows } = await supabase
    .from('change_requests')
    .select('target_id')
    .eq('target_type', 'student')
    .eq('status', 'pending')

  const pendingStudentIds = new Set((pendingRows ?? []).map((r) => r.target_id))

  const currentClass = classes?.find((c) => c.id === classe)

  const sortedEnrollments = [...(enrollments ?? [])].sort((a: any, b: any) => {
    const aPending = pendingStudentIds.has(a.students?.id) ? 0 : 1
    const bPending = pendingStudentIds.has(b.students?.id) ? 0 : 1
    return aPending - bPending
  })

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-slate-900">
            Eleves{currentClass ? ` - ${currentClass.niveau}${currentClass.local ? ` Local ${currentClass.local}` : ''}` : ''}
          </h1>
          <Link
            href="/eleves/nouveau"
            className="bg-slate-900 text-white text-sm px-4 py-2 rounded font-medium"
          >
            + Nouvel eleve
          </Link>
        </div>

        <div className="mb-4">
          <ClassFilter classes={classes ?? []} currentClasse={classe ?? ''} />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Matricule</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Nom</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Classe</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Statut</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Parent</th>
              </tr>
            </thead>
            <tbody>
              {sortedEnrollments.map((e: any) => {
                const status = e.students?.status
                const isPending = pendingStudentIds.has(e.students?.id)
                return (
                  <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-500">
                      <Link href={`/eleves/${e.students?.id}`}>{e.students?.matricule}</Link>
                    </td>
                    <td className="px-4 py-2 text-slate-900">
                      <Link href={`/eleves/${e.students?.id}`} className="flex items-center gap-2">
                        {e.students?.first_name} {e.students?.last_name}
                        {isPending && (
                          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                            En attente
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {e.classes?.name} ({e.classes?.niveau})
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABELS[status] ?? status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {linkedStudentIds.has(e.students?.id) ? (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">Lie</span>
                      ) : (
                        <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">Non lie</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {sortedEnrollments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Aucun eleve trouve
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
