'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const updateSchema = z.object({
  student_id: z.string().uuid(),
  first_name: z.string().min(1, 'Le prénom est requis').max(100),
  last_name: z.string().min(1, 'Le nom est requis').max(100),
  date_naissance: z.string().optional().or(z.literal('')),
  lieu_naissance: z.string().max(200).optional().or(z.literal('')),
  adresse: z.string().max(300).optional().or(z.literal('')),
  acte_naissance_numero: z.string().max(100).optional().or(z.literal('')),
  guardian_name: z.string().max(150).optional().or(z.literal('')),
  guardian_phone: z.string().max(30).optional().or(z.literal('')),
})

export interface UpdateStudentState {
  error?: string
  success?: boolean
}

export async function updateStudent(
  _prevState: UpdateStudentState,
  formData: FormData
): Promise<UpdateStudentState> {
  const parsed = updateSchema.safeParse({
    student_id: formData.get('student_id'),
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    date_naissance: formData.get('date_naissance'),
    lieu_naissance: formData.get('lieu_naissance'),
    adresse: formData.get('adresse'),
    acte_naissance_numero: formData.get('acte_naissance_numero'),
    guardian_name: formData.get('guardian_name'),
    guardian_phone: formData.get('guardian_phone'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Champs invalides' }
  }

  const supabase = await createClient()
  const { student_id, ...fields } = parsed.data

  const { error } = await supabase
    .from('students')
    .update({
      first_name: fields.first_name,
      last_name: fields.last_name,
      date_naissance: fields.date_naissance || null,
      lieu_naissance: fields.lieu_naissance || null,
      adresse: fields.adresse || null,
      acte_naissance_numero: fields.acte_naissance_numero || null,
      guardian_name: fields.guardian_name || null,
      guardian_phone: fields.guardian_phone || null,
    })
    .eq('id', student_id)

  if (error) {
    return { error: 'Erreur lors de la mise à jour. Vérifiez vos permissions.' }
  }

  revalidatePath('/eleves')
  revalidatePath(`/eleves/${student_id}`)
  return { success: true }
}

export async function changeStudentStatus(studentId: string, status: 'actif' | 'inactif' | 'transfere') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('students')
    .update({ status })
    .eq('id', studentId)

  if (error) {
    return { error: 'Erreur lors du changement de statut.' }
  }

  revalidatePath('/eleves')
  revalidatePath(`/eleves/${studentId}`)
  return { success: true }
}
