import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import StudentDetail from './student-detail'
import ParentsClient from './parents-client'

const STATUS_LABELS: Record<string, string> = {
  actif: 'Actif',
  archive: 'Archive',
  transfere: 'Transfere',
  diplome: 'Diplome',
}

export default async function ElevePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: student } = await supabase
    .from('students')
    .select('id, matricule, first_name, post_nom, last_name, sexe, date_naissance, lieu_naissance, adresse, acte_naissance_numero, guardian_name, guardian_phone, guardian_address, emergency_contact_name, emergency_contact_relation, emergency_contact_phone, status, school_id')
    .eq('id', id)
    .single()

  if (!student) notFound()

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('classes ( name, niveau )')
    .eq('student_id', id)
    .order('date_inscription', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: linkedRows } = await supabase
    .from('parent_students')
    .select('id, parent_id, users:parent_id ( full_name )')
    .eq('student_id', id)

  const linkedParents = (linkedRows ?? []).map((r: any) => ({
    id: r.id,
    parent_id: r.parent_id,
    full_name: r.users?.full_name ?? 'Inconnu',
  }))

  const linkedIds = new Set(linkedParents.map((p) => p.parent_id))

  const { data: allParents } = await supabase
    .from('users')
    .select('id, full_name, roles!inner ( slug )')
    .eq('school_id', student.school_id)
    .eq('roles.slug', 'parent')
    .eq('is_active', true)

  const availableParents = (allParents ?? [])
    .filter((p: any) => !linkedIds.has(p.id))
    .map((p: any) => ({ id: p.id, full_name: p.full_name }))

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold text-slate-900">
            {student.first_name} {student.post_nom} {student.last_name}
          </h1>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {student.matricule}
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          {(enrollment?.classes as any)?.name ?? 'Aucune classe'} - Statut : {STATUS_LABELS[student.status] ?? student.status}
        </p>

        <StudentDetail student={student} />

        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-6 mb-2">
          Parents
        </h2>
        <ParentsClient
          studentId={student.id}
          linkedParents={linkedParents}
          availableParents={availableParents}
        />
      </div>
    </div>
  )
}
