'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const subjectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(150),
  code: z.string().max(20).optional().or(z.literal('')),
})

export interface SubjectFormState {
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
}

export async function createSubject(
  _prevState: SubjectFormState,
  formData: FormData
): Promise<SubjectFormState> {
  const parsed = subjectSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { error: 'Veuillez corriger les champs en rouge.', fieldErrors }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: 'Non authentifie' }

  const { data: profile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile) return { error: 'Profil introuvable' }

  const { error } = await supabase.from('subjects').insert({
    school_id: profile.school_id,
    name: parsed.data.name,
    code: parsed.data.code || null,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Cette matiere existe deja.', fieldErrors: { name: 'Cette matiere existe deja.' } }
    }
    return { error: 'Erreur lors de la creation. Verifiez vos permissions.' }
  }

  revalidatePath('/matieres')
  return { success: true }
}

export async function updateSubject(subjectId: string, name: string, code: string) {
  const parsed = subjectSchema.safeParse({ name, code })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Champs invalides' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('subjects')
    .update({ name: parsed.data.name, code: parsed.data.code || null })
    .eq('id', subjectId)

  if (error) {
    if (error.code === '23505') {
      return { error: 'Cette matiere existe deja.' }
    }
    return { error: 'Erreur lors de la modification.' }
  }

  revalidatePath('/matieres')
  return { success: true }
}

export async function toggleSubjectActive(subjectId: string, isActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('subjects')
    .update({ is_active: isActive })
    .eq('id', subjectId)

  if (error) {
    return { error: 'Erreur lors de la mise a jour.' }
  }

  revalidatePath('/matieres')
  return { success: true }
}
