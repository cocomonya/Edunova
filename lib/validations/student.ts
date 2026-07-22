import { z } from 'zod'

export const studentSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis').max(100),
  last_name: z.string().min(1, 'Le nom est requis').max(100),
  date_naissance: z.string().optional().or(z.literal('')),
  lieu_naissance: z.string().max(200).optional().or(z.literal('')),
  adresse: z.string().max(300).optional().or(z.literal('')),
  acte_naissance_numero: z.string().max(100).optional().or(z.literal('')),
  guardian_name: z.string().max(150).optional().or(z.literal('')),
  guardian_phone: z.string().max(30).optional().or(z.literal('')),
  class_id: z.string().uuid('Classe invalide'),
})

export type StudentFormValues = z.infer<typeof studentSchema>
