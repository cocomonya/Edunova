'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface ActionResult {
  error?: string
  success?: boolean
  pending?: boolean
}

async function getActorContext() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('school_id, roles ( slug )')
    .eq('id', userData.user.id)
    .single()

  if (!profile) return null

  return {
    supabase,
    userId: userData.user.id,
    schoolId: profile.school_id,
    roleSlug: (profile.roles as any)?.slug as string | undefined,
  }
}

export async function submitChange(
  targetType: 'student' | 'user',
  targetId: string,
  targetLabel: string,
  actionType: 'update' | 'delete',
  payload: Record<string, any> | null,
  reason?: string
): Promise<ActionResult> {
  const ctx = await getActorContext()
  if (!ctx) return { error: 'Non authentifie' }

  const isDirecteur = ctx.roleSlug === 'directeur'

  if (isDirecteur) {
    const execResult = await executeChange(targetType, targetId, actionType, payload)
    if (execResult.error) return execResult

    await ctx.supabase.from('change_requests').insert({
      school_id: ctx.schoolId,
      target_type: targetType,
      target_id: targetId,
      target_label: targetLabel,
      action_type: actionType,
      payload,
      reason: reason || null,
      status: 'approved',
      requested_by: ctx.userId,
      resolved_by: ctx.userId,
      resolved_at: new Date().toISOString(),
    })

    revalidatePath('/eleves')
    revalidatePath('/utilisateurs')
    return { success: true }
  }

  const { error } = await ctx.supabase.from('change_requests').insert({
    school_id: ctx.schoolId,
    target_type: targetType,
    target_id: targetId,
    target_label: targetLabel,
    action_type: actionType,
    payload,
    reason: reason || null,
    status: 'pending',
    requested_by: ctx.userId,
  })

  if (error) {
    return { error: 'Erreur lors de la creation de la demande.' }
  }

  revalidatePath('/eleves')
  revalidatePath('/utilisateurs')
  return { pending: true }
}

async function executeChange(
  targetType: 'student' | 'user',
  targetId: string,
  actionType: 'update' | 'delete',
  payload: Record<string, any> | null
): Promise<ActionResult> {
  // NOTE (audit MVP) : la suppression reelle d'un eleve ou d'un utilisateur
  // n'est plus une action produit valide depuis l'introduction de l'archivage
  // (eleves) et de la desactivation (utilisateurs). Ce chemin n'a plus aucun
  // appelant dans l'application. On le neutralise explicitement plutot que de
  // le supprimer, pour qu'une regression future ne puisse pas le reactiver
  // silencieusement et executer une suppression irreversible.
  if (actionType === 'delete') {
    return { error: 'La suppression reelle est desactivee. Utilisez l archivage ou la desactivation.' }
  }

  const supabase = await createClient()

  if (targetType === 'student') {
    const { error } = await supabase.from('students').update(payload ?? {}).eq('id', targetId)
    if (error) return { error: 'Erreur lors de la modification.' }
    return { success: true }
  }

  if (targetType === 'user') {
    const { error } = await supabase.from('users').update(payload ?? {}).eq('id', targetId)
    if (error) return { error: 'Erreur lors de la modification.' }
    return { success: true }
  }

  return { error: 'Type de cible invalide' }
}

export async function resolveChange(requestId: string, decision: 'approved' | 'rejected'): Promise<ActionResult> {
  const ctx = await getActorContext()
  if (!ctx || ctx.roleSlug !== 'directeur') {
    return { error: 'Non autorise' }
  }

  const { data: request } = await ctx.supabase
    .from('change_requests')
    .select('id, target_type, target_id, action_type, payload, status')
    .eq('id', requestId)
    .single()

  if (!request || request.status !== 'pending') {
    return { error: 'Demande introuvable ou deja traitee' }
  }

  if (decision === 'approved') {
    const execResult = await executeChange(
      request.target_type as 'student' | 'user',
      request.target_id,
      request.action_type as 'update' | 'delete',
      request.payload
    )
    if (execResult.error) return execResult
  }

  const { error } = await ctx.supabase
    .from('change_requests')
    .update({
      status: decision,
      resolved_by: ctx.userId,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) {
    return { error: 'Erreur lors de la resolution de la demande.' }
  }

  revalidatePath('/demandes')
  revalidatePath('/eleves')
  revalidatePath('/utilisateurs')
  return { success: true }
}
