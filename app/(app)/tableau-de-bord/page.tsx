import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  GraduationCap,
  BookOpen,
  Users,
  ClipboardList,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'

interface StatCard {
  label: string
  value: number
  href: string
  icon: LucideIcon
  accent: string
}

interface QuickAction {
  label: string
  href: string
  icon: LucideIcon
}

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

  let stats: StatCard[] = []
  let quickActions: QuickAction[] = []

  if (roleSlug === 'directeur' || roleSlug === 'secretaire') {
    const [{ count: studentsCount }, { count: classesCount }, { count: usersCount }, { count: pendingCount }] =
      await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'actif'),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('change_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ])
    stats = [
      { label: 'Eleves actifs', value: studentsCount ?? 0, href: '/eleves', icon: GraduationCap, accent: 'bg-blue-50 text-blue-600' },
      { label: 'Classes', value: classesCount ?? 0, href: '/classes', icon: BookOpen, accent: 'bg-purple-50 text-purple-600' },
      { label: 'Utilisateurs actifs', value: usersCount ?? 0, href: '/utilisateurs', icon: Users, accent: 'bg-slate-100 text-slate-600' },
    ]
    if (roleSlug === 'directeur') {
      stats.push({
        label: 'Demandes en attente',
        value: pendingCount ?? 0,
        href: '/demandes',
        icon: ClipboardList,
        accent: 'bg-amber-50 text-amber-600',
      })
    }
    quickActions = [
      { label: 'Nouvel eleve', href: '/eleves/nouveau', icon: UserPlus },
      { label: 'Nouvel utilisateur', href: '/utilisateurs/nouveau', icon: UserPlus },
    ]
  } else if (roleSlug === 'enseignant') {
    const { count: assignmentsCount } = await supabase
      .from('teacher_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('teacher_id', user.id)
    stats = [
      { label: 'Mes classes', value: assignmentsCount ?? 0, href: '/notes', icon: BookOpen, accent: 'bg-purple-50 text-purple-600' },
    ]
  } else if (roleSlug === 'parent') {
    const { count: childrenCount } = await supabase
      .from('parent_students')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', user.id)
    stats = [
      { label: 'Mes enfants', value: childrenCount ?? 0, href: '/notes', icon: Users, accent: 'bg-blue-50 text-blue-600' },
    ]
  }

  const firstName = (profile?.full_name ?? user.email ?? '').split(' ')[0]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir'

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-900 rounded-xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-12 translate-x-12" />
          <p className="text-slate-400 text-xs mb-1 capitalize">{today}</p>
          <h1 className="text-xl font-semibold text-white">
            {greeting}, {firstName}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-medium">
              {roleName}
            </span>
            <span className="text-slate-400 text-xs">{schoolName}</span>
          </div>
        </div>

        {quickActions.length > 0 && (
          <div className="flex gap-3 mb-6">
            {quickActions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400 transition-colors"
              >
                <a.icon size={16} strokeWidth={2} />
                {a.label}
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.accent}`}>
                <s.icon size={18} strokeWidth={2} />
              </div>
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
