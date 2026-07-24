'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  niveau: z.enum([
    '1re primaire', '2e primaire', '3e primaire', '4e primaire',
    '5e primaire', '6e primaire', '7e primaire', '8e primaire',
  ]),
  local: z.string().max(20).optional().or(z.literal('')),
  titulaire_id: z.string().uuid().optional().or(z.literal('')),
  academic_year_id: z.string().uuid(),
})

export interface CreateClassState {
  error?: string
  success?: boolean
}

export async function createClass(
  _prevState: CreateClassState,
  formData: FormData
): Promise<CreateClassState> {
  const parsed = schema.safeParse({
    niveau: formData.get('niveau'),
    local: formData.get('local'),
    titulaire_id: formData.get('titulaire_id'),
    academic_year_id: formData.get('academic_year_id'),
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

  const local = parsed.data.local || ''
  const name = local ? `${parsed.data.niveau} - Local ${local}` : parsed.data.niveau

  const { error } = await supabase.from('classes').insert({
    school_id: profile.school_id,
    academic_year_id: parsed.data.academic_year_id,
    niveau: parsed.data.niveau,
    local: local || null,
    titulaire_id: parsed.data.titulaire_id || null,
    name,
  })

  if (error) {
    return { error: 'Erreur lors de la creation. Verifiez vos permissions.' }
  }

  revalidatePath('/classes')
  return { success: true }
}
