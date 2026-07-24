import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function TableauDeBordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, school_id, roles ( slug, name ), schools ( name )')
    .eq('id', user.id)
    .single()

  const roleSlug = (profile?.roles as any)?.slug as string | undefined
  const roleName = (profile?.roles as any)?.name as string | undefined
  const schoolName = (profile?.schools as any)?.name as string | undefined

  let stats: { label: string; value: number; href: string }[] = []

  if (roleSlug === 'directeur' || roleSlug === 'secretaire') {
    const [{ count: studentsCount }, { count: classesCount }, { count: usersCount }] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'actif'),
      supabase.from('classes').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ])
    stats = [
      { label: 'Eleves actifs', value: studentsCount ?? 0, href: '/eleves' },
      { label: 'Classes', value: classesCount ?? 0, href: '/classes' },
      { label: 'Utilisateurs actifs', value: usersCount ?? 0, href: '/utilisateurs' },
    ]
  } else if (roleSlug === 'enseignant') {
    const { count: assignmentsCount } = await supabase
      .from('teacher_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('teacher_id', user.id)
    stats = [
      { label: 'Mes classes', value: assignmentsCount ?? 0, href: '/notes' },
    ]
  } else if (roleSlug === 'parent') {
    const { count: childrenCount } = await supabase
      .from('parent_students')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', user.id)
    stats = [
      { label: 'Mes enfants', value: childrenCount ?? 0, href: '/notes' },
    ]
  }

  const firstName = (profile?.full_name ?? user.email ?? '').split(' ')[0]

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-900 rounded-xl p-6 mb-6">
          <p className="text-slate-300 text-sm mb-1">Bienvenue sur EduNova</p>
          <h1 className="text-xl font-semibold text-white">
            Bonjour {firstName} !
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {roleName} - {schoolName}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-400"
            >
              <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </Link>
          ))}
          {stats.length === 0 && (
            <p className="text-sm text-slate-400 col-span-full">
              Aucune donnee disponible pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
