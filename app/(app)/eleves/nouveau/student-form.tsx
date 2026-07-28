'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStudent, type CreateStudentState } from '../actions'

interface ClasseOption {
  id: string
  name: string
  niveau: string
}

const initialState: CreateStudentState = {}

const SECTIONS = [
  { id: 'identite', label: 'Identite' },
  { id: 'scolarite', label: 'Scolarite' },
  { id: 'naissance', label: 'Naissance' },
  { id: 'tuteur', label: 'Tuteur' },
  { id: 'urgence', label: 'Urgence' },
] as const

function inputClass(hasError?: boolean) {
  return `w-full border rounded px-3 py-2 text-sm ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'
  } outline-none`
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-600 mt-1">{message}</p>
}

export default function StudentForm({ classes }: { classes: ClasseOption[] }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createStudent, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [activeSection, setActiveSection] = useState<string>('identite')
  const fieldErrors = state.fieldErrors ?? {}

  useEffect(() => {
    if (!state.success) return
    if (state.intent === 'another') {
      const classSelect = formRef.current?.elements.namedItem('class_id') as HTMLSelectElement | null
      const keepClassId = classSelect?.value ?? ''
      formRef.current?.reset()
      if (classSelect) classSelect.value = keepClassId
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push('/eleves')
    }
  }, [state.success, state.intent, router])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm -mx-4 px-4 py-2 mb-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeSection === s.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <form ref={formRef} action={formAction} className="space-y-5 bg-white p-6 rounded-lg border border-slate-200">
        {state.error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">
            {state.error}
          </div>
        )}

        <div id="identite" className="scroll-mt-16">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Identite
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prenom *</label>
              <input name="first_name" required className={inputClass(!!fieldErrors.first_name)} />
              <FieldError message={fieldErrors.first_name} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Post-nom</label>
              <input name="post_nom" className={inputClass(!!fieldErrors.post_nom)} />
              <FieldError message={fieldErrors.post_nom} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
              <input name="last_name" required className={inputClass(!!fieldErrors.last_name)} />
              <FieldError message={fieldErrors.last_name} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sexe</label>
              <select name="sexe" defaultValue="" className={inputClass(!!fieldErrors.sexe)}>
                <option value="">-- Choisir --</option>
                <option value="M">Masculin</option>
                <option value="F">Feminin</option>
              </select>
              <FieldError message={fieldErrors.sexe} />
            </div>
          </div>
        </div>

        <div id="scolarite" className="scroll-mt-16">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Scolarite
          </h3>
          <label className="block text-sm font-medium text-slate-700 mb-1">Classe *</label>
          <select name="class_id" required className={inputClass(!!fieldErrors.class_id)}>
            <option value="">-- Choisir --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.niveau})</option>
            ))}
          </select>
          <FieldError message={fieldErrors.class_id} />
        </div>

        <div id="naissance" className="scroll-mt-16">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Naissance et adresse
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
              <input type="date" name="date_naissance" className={inputClass(!!fieldErrors.date_naissance)} />
              <FieldError message={fieldErrors.date_naissance} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lieu de naissance</label>
              <input name="lieu_naissance" className={inputClass(!!fieldErrors.lieu_naissance)} />
              <FieldError message={fieldErrors.lieu_naissance} />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
            <input name="adresse" className={inputClass(!!fieldErrors.adresse)} />
            <FieldError message={fieldErrors.adresse} />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">N acte de naissance</label>
            <input name="acte_naissance_numero" className={inputClass(!!fieldErrors.acte_naissance_numero)} />
            <FieldError message={fieldErrors.acte_naissance_numero} />
          </div>
        </div>

        <div id="tuteur" className="scroll-mt-16">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Tuteur
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom du tuteur</label>
              <input name="guardian_name" className={inputClass(!!fieldErrors.guardian_name)} />
              <FieldError message={fieldErrors.guardian_name} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telephone tuteur</label>
              <input name="guardian_phone" className={inputClass(!!fieldErrors.guardian_phone)} />
              <FieldError message={fieldErrors.guardian_phone} />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse du tuteur</label>
            <input name="guardian_address" className={inputClass(!!fieldErrors.guardian_address)} />
            <FieldError message={fieldErrors.guardian_address} />
          </div>
        </div>

        <div id="urgence" className="scroll-mt-16">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Contact d urgence
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
              <input name="emergency_contact_name" className={inputClass(!!fieldErrors.emergency_contact_name)} />
              <FieldError message={fieldErrors.emergency_contact_name} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lien de parente</label>
              <input name="emergency_contact_relation" placeholder="Oncle, voisin..." className={inputClass(!!fieldErrors.emergency_contact_relation)} />
              <FieldError message={fieldErrors.emergency_contact_relation} />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Telephone</label>
            <input name="emergency_contact_phone" className={inputClass(!!fieldErrors.emergency_contact_phone)} />
            <FieldError message={fieldErrors.emergency_contact_phone} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            name="intent"
            value="list"
            disabled={isPending}
            className="flex-1 bg-slate-900 text-white rounded py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {isPending ? 'Creation...' : "Creer l'eleve"}
          </button>
          <button
            type="submit"
            name="intent"
            value="another"
            disabled={isPending}
            className="flex-1 bg-white text-slate-700 border border-slate-300 rounded py-2.5 text-sm font-medium disabled:opacity-50"
          >
            Creer et ajouter un autre
          </button>
          <button
            type="button"
            onClick={() => router.push('/eleves')}
            className="px-4 py-2.5 rounded border border-slate-200 text-sm text-slate-500"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
