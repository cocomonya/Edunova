'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  class_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  academic_year_id: z.string().uuid(),
  teacher_id: z.string().uuid().optional().or(z.literal('')),
})

export interface AssignTeacherState {
  error?: string
  success?: boolean
}

export async function assignTeacher(
  _prevState: AssignTeacherState,
  formData: FormData
): Promise<AssignTeacherState> {
  const parsed = schema.safeParse({
    class_id: formData.get('class_id'),
    subject_id: formData.get('subject_id'),
    academic_year_id: formData.get('academic_year_id'),
    teacher_id: formData.get('teacher_id'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Champs invalides' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { error: 'Non authentifie' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile) {
    return { error: 'Profil introuvable' }
  }

  if (!parsed.data.teacher_id) {
    const { error } = await supabase
      .from('teacher_assignments')
      .delete()
      .eq('class_id', parsed.data.class_id)
      .eq('subject_id', parsed.data.subject_id)
      .eq('academic_year_id', parsed.data.academic_year_id)

    if (error) {
      return { error: 'Erreur lors de la suppression de l affectation.' }
    }
    revalidatePath('/classes')
    return { success: true }
  }

  const { error } = await supabase.from('teacher_assignments').upsert(
    {
      school_id: profile.school_id,
      class_id: parsed.data.class_id,
      subject_id: parsed.data.subject_id,
      academic_year_id: parsed.data.academic_year_id,
      teacher_id: parsed.data.teacher_id,
    },
    { onConflict: 'class_id,subject_id,academic_year_id' }
  )

  if (error) {
    return { error: 'Erreur lors de l affectation. Verifiez vos permissions.' }
  }

  revalidatePath('/classes')
  return { success: true }
}
