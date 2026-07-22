import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import StudentEditForm from './student-edit-form'
import StatusActions from './status-actions'

export default async function ElevePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: student } = await supabase
    .from('students')
    .select('id, matricule, first_name, last_name, date_naissance, lieu_naissance, adresse, acte_naissance_numero, guardian_name, guardian_phone, status')
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

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold text-slate-900">
            {student.first_name} {student.last_name}
          </h1>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {student.matricule}
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          {(enrollment?.classes as any)?.name ?? 'Aucune classe'} - Statut : {student.status}
        </p>

        <StatusActions studentId={student.id} currentStatus={student.status} />

        <div className="mt-6">
          <StudentEditForm student={student} />
        </div>
      </div>
    </div>
  )
}
