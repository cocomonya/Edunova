'use server'

import { revalidatePath } from 'next/cache'
import { studentSchema } from '@/lib/validations/student'
import { createClient } from '@/lib/supabase/server'

export interface CreateStudentState {
  error?: string
  success?: boolean
}

export async function createStudent(
  _prevState: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  const parsed = studentSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    date_naissance: formData.get('date_naissance'),
    lieu_naissance: formData.get('lieu_naissance'),
    adresse: formData.get('adresse'),
    acte_naissance_numero: formData.get('acte_naissance_numero'),
    guardian_name: formData.get('guardian_name'),
    guardian_phone: formData.get('guardian_phone'),
    class_id: formData.get('class_id'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Champs invalides' }
  }

  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { error: 'Non authentifié' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile) {
    return { error: 'Profil introuvable' }
  }

  const { data: academicYear } = await supabase
    .from('academic_years')
    .select('id')
    .eq('school_id', profile.school_id)
    .eq('is_current', true)
    .single()

  if (!academicYear) {
    return { error: "Aucune année scolaire courante définie pour l'école" }
  }

  const { error } = await supabase.rpc('create_student_with_enrollment', {
    p_school_id: profile.school_id,
    p_first_name: parsed.data.first_name,
    p_last_name: parsed.data.last_name,
    p_date_naissance: parsed.data.date_naissance || null,
    p_lieu_naissance: parsed.data.lieu_naissance || null,
    p_adresse: parsed.data.adresse || null,
    p_acte_naissance_numero: parsed.data.acte_naissance_numero || null,
    p_guardian_name: parsed.data.guardian_name || null,
    p_guardian_phone: parsed.data.guardian_phone || null,
    p_class_id: parsed.data.class_id,
    p_academic_year_id: academicYear.id,
  })

  if (error) {
    return { error: "Erreur lors de la création de l'élève. Vérifiez vos permissions." }
  }

  revalidatePath('/eleves')
  return { success: true }
}
