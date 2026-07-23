'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const createUserSchema = z.object({
  full_name: z.string().min(1, 'Le nom complet est requis').max(150),
  email: z.string().email('Email invalide'),
  role_slug: z.enum(['directeur', 'secretaire', 'comptable', 'enseignant', 'parent']),
})

export interface CreateUserState {
  error?: string
  success?: boolean
  tempPassword?: string
  email?: string
}

function generateTempPassword() {
  const raw = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '')
  return raw.slice(0, 8) + 'A1!'
}

export async function createUserAccount(
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  const parsed = createUserSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    role_slug: formData.get('role_slug'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Champs invalides' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { error: 'Non authentifie' }
  }

  const { data: actorProfile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', userData.user.id)
    .single()

  if (!actorProfile) {
    return { error: 'Profil introuvable' }
  }

  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('slug', parsed.data.role_slug)
    .single()

  if (!role) {
    return { error: 'Role invalide' }
  }

  const tempPassword = generateTempPassword()
  const admin = createAdminClient()

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError || !authUser.user) {
    return { error: authError?.message ?? 'Erreur lors de la creation du compte' }
  }

  const { error: profileError } = await admin.from('users').insert({
    id: authUser.user.id,
    school_id: actorProfile.school_id,
    role_id: role.id,
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    is_active: true,
    must_change_password: true,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(authUser.user.id)
    return { error: 'Erreur lors de la creation du profil' }
  }

  revalidatePath('/utilisateurs')
  return { success: true, tempPassword, email: parsed.data.email }
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)

  if (error) {
    return { error: 'Erreur lors de la mise a jour du statut.' }
  }

  revalidatePath('/utilisateurs')
  return { success: true }
}
