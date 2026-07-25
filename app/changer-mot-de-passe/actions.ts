'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres'),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm'],
})

export interface ChangePasswordState {
  error?: string
  success?: boolean
}

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const parsed = schema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Champs invalides' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { error: 'Non authentifie' }
  }

  const { error: profileError } = await supabase
    .from('users')
    .update({ must_change_password: false })
    .eq('id', userData.user.id)

  if (profileError) {
    return { error: 'Erreur lors de la mise a jour du profil.' }
  }

  const { error: authError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (authError) {
    await supabase.from('users').update({ must_change_password: true }).eq('id', userData.user.id)
    return { error: authError.message }
  }

  await supabase.auth.signOut()

  return { success: true }
}
