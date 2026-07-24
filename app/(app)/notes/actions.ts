'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const evaluationSchema = z.object({
  class_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  academic_year_id: z.string().uuid(),
  title: z.string().min(1, 'Le titre est requis').max(150),
  type: z.enum(['interrogation', 'devoir', 'examen']),
  max_score: z.coerce.number().positive(),
  coefficient: z.coerce.number().positive(),
})

export interface EvaluationState {
  error?: string
  success?: boolean
  evaluationId?: string
}

export async function createEvaluation(
  _prevState: EvaluationState,
  formData: FormData
): Promise<EvaluationState> {
  const parsed = evaluationSchema.safeParse({
    class_id: formData.get('class_id'),
    subject_id: formData.get('subject_id'),
    academic_year_id: formData.get('academic_year_id'),
    title: formData.get('title'),
    type: formData.get('type'),
    max_score: formData.get('max_score'),
    coefficient: formData.get('coefficient'),
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

  const { data: evaluation, error } = await supabase
    .from('evaluations')
    .insert({
      school_id: profile.school_id,
      class_id: parsed.data.class_id,
      subject_id: parsed.data.subject_id,
      academic_year_id: parsed.data.academic_year_id,
      title: parsed.data.title,
      type: parsed.data.type,
      max_score: parsed.data.max_score,
      coefficient: parsed.data.coefficient,
      created_by: userData.user.id,
    })
    .select('id')
    .single()

  if (error || !evaluation) {
    return { error: 'Erreur lors de la creation. Verifiez vos permissions.' }
  }

  revalidatePath('/notes')
  return { success: true, evaluationId: evaluation.id }
}

export interface SaveGradesState {
  error?: string
  success?: boolean
}

export async function saveGrades(
  _prevState: SaveGradesState,
  formData: FormData
): Promise<SaveGradesState> {
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

  const evaluationId = formData.get('evaluation_id') as string
  if (!evaluationId) {
    return { error: 'Evaluation manquante' }
  }

  const rows: { school_id: string; student_id: string; evaluation_id: string; score: number; created_by: string }[] = []

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('score_') && typeof value === 'string' && value.trim() !== '') {
      const studentId = key.replace('score_', '')
      const score = Number(value)
      if (!Number.isNaN(score)) {
        rows.push({
          school_id: profile.school_id,
          student_id: studentId,
          evaluation_id: evaluationId,
          score,
          created_by: userData.user.id,
        })
      }
    }
  }

  if (rows.length === 0) {
    return { error: 'Aucune note a enregistrer' }
  }

  const { error } = await supabase
    .from('grades')
    .upsert(rows, { onConflict: 'student_id,evaluation_id' })

  if (error) {
    return { error: 'Erreur lors de l enregistrement. Verifiez vos permissions.' }
  }

  revalidatePath('/notes')
  return { success: true }
}
