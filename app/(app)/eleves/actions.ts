'use server'

import { revalidatePath } from 'next/cache'
import { studentSchema } from '@/lib/validations/student'
import { createClient } from '@/lib/supabase/server'

export interface CreateStudentState {
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
  intent?: 'list' | 'another'
}

export async function createStudent(
  _prevState: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  const intent = (formData.get('intent') as 'list' | 'another') || 'list'

  const parsed = studentSchema.safeParse({
    first_name: formData.get('first_name'),
    post_nom: formData.get('post_nom'),
    last_name: formData.get('last_name'),
    sexe: formData.get('sexe'),
    date_naissance: formData.get('date_naissance'),
    lieu_naissance: formData.get('lieu_naissance'),
    adresse: formData.get('adresse'),
    acte_naissance_numero: formData.get('acte_naissance_numero'),
    guardian_name: formData.get('guardian_name'),
    guardian_phone: formData.get('guardian_phone'),
    guardian_address: formData.get('guardian_address'),
    emergency_contact_name: formData.get('emergency_contact_name'),
    emergency_contact_relation: formData.get('emergency_contact_relation'),
    emergency_contact_phone: formData.get('emergency_contact_phone'),
    class_id: formData.get('class_id'),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return {
      error: 'Veuillez corriger les champs en rouge ci-dessous.',
      fieldErrors,
      intent,
    }
  }

  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { error: 'Non authentifié', intent }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile) {
    return { error: 'Profil introuvable', intent }
  }

  const { data: academicYear } = await supabase
    .from('academic_years')
    .select('id')
    .eq('school_id', profile.school_id)
    .eq('is_current', true)
    .single()

  if (!academicYear) {
    return { error: "Aucune année scolaire courante définie pour l'école", intent }
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
    p_post_nom: parsed.data.post_nom || null,
    p_sexe: parsed.data.sexe || null,
    p_guardian_address: parsed.data.guardian_address || null,
    p_emergency_contact_name: parsed.data.emergency_contact_name || null,
    p_emergency_contact_relation: parsed.data.emergency_contact_relation || null,
    p_emergency_contact_phone: parsed.data.emergency_contact_phone || null,
  })

  if (error) {
    return { error: "Erreur lors de la création de l'élève. Vérifiez vos permissions.", intent }
  }

  revalidatePath('/eleves')
  return { success: true, intent }
}
