'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { submitChange, type ActionResult } from '@/app/(app)/demandes/actions'

const updateSchema = z.object({
  student_id: z.string().uuid(),
  first_name: z.string().min(1, 'Le prénom est requis').max(100),
  post_nom: z.string().max(100).optional().or(z.literal('')),
  last_name: z.string().min(1, 'Le nom est requis').max(100),
  sexe: z.enum(['M', 'F']).optional().or(z.literal('')),
  date_naissance: z.string().optional().or(z.literal('')),
  lieu_naissance: z.string().max(200).optional().or(z.literal('')),
  adresse: z.string().max(300).optional().or(z.literal('')),
  acte_naissance_numero: z.string().max(100).optional().or(z.literal('')),
  guardian_name: z.string().max(150).optional().or(z.literal('')),
  guardian_phone: z.string().max(30).optional().or(z.literal('')),
  guardian_address: z.string().max(300).optional().or(z.literal('')),
  emergency_contact_name: z.string().max(150).optional().or(z.literal('')),
  emergency_contact_relation: z.string().max(100).optional().or(z.literal('')),
  emergency_contact_phone: z.string().max(30).optional().or(z.literal('')),
})

export interface UpdateStudentState extends ActionResult {
  fieldErrors?: Record<string, string>
}

export async function requestStudentUpdate(
  _prevState: UpdateStudentState,
  formData: FormData
): Promise<UpdateStudentState> {
  const parsed = updateSchema.safeParse({
    student_id: formData.get('student_id'),
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
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { error: 'Veuillez corriger les champs en rouge ci-dessous.', fieldErrors }
  }

  const { student_id, ...fields } = parsed.data

  const payload = {
    first_name: fields.first_name,
    post_nom: fields.post_nom || null,
    last_name: fields.last_name,
    sexe: fields.sexe || null,
    date_naissance: fields.date_naissance || null,
    lieu_naissance: fields.lieu_naissance || null,
    adresse: fields.adresse || null,
    acte_naissance_numero: fields.acte_naissance_numero || null,
    guardian_name: fields.guardian_name || null,
    guardian_phone: fields.guardian_phone || null,
    guardian_address: fields.guardian_address || null,
    emergency_contact_name: fields.emergency_contact_name || null,
    emergency_contact_relation: fields.emergency_contact_relation || null,
    emergency_contact_phone: fields.emergency_contact_phone || null,
  }

  const label = `${fields.first_name} ${fields.last_name} - Modification des informations`

  return submitChange('student', student_id, label, 'update', payload)
}

const STATUS_LABELS: Record<string, string> = {
  actif: 'Actif',
  archive: 'Archive',
  transfere: 'Transfere',
  diplome: 'Diplome',
}

export async function requestStudentStatusChange(
  studentId: string,
  studentName: string,
  status: 'actif' | 'archive' | 'transfere' | 'diplome'
): Promise<ActionResult> {
  const label = `${studentName} - Statut vers "${STATUS_LABELS[status]}"`
  return submitChange('student', studentId, label, 'update', { status })
}

export async function linkParent(studentId: string, parentId: string) {
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

  const { error } = await supabase.from('parent_students').insert({
    school_id: profile.school_id,
    parent_id: parentId,
    student_id: studentId,
  })

  if (error) {
    return { error: 'Erreur lors du rattachement.' }
  }

  return { success: true }
}

export async function unlinkParent(parentStudentId: string, studentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('parent_students')
    .delete()
    .eq('id', parentStudentId)

  if (error) {
    return { error: 'Erreur lors du detachement.' }
  }

  return { success: true }
}
