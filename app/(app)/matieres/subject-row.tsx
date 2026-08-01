'use client'

import { useState, useTransition } from 'react'
import { updateSubject, toggleSubjectActive } from './actions'

interface Subject {
  id: string
  name: string
  code: string | null
  is_active: boolean
}

export default function SubjectRow({ subject }: { subject: Subject }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(subject.name)
  const [code, setCode] = useState(subject.code ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateSubject(subject.id, name, code)
      if (result.error) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  function handleToggle() {
    startTransition(async () => {
      await toggleSubjectActive(subject.id, !subject.is_active)
    })
  }

  if (editing) {
    return (
      <div className="p-4 space-y-2">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
            placeholder="Nom de la matiere"
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-24 border border-slate-300 rounded px-3 py-2 text-sm"
            placeholder="Code"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-medium disabled:opacity-50"
          >
            Enregistrer
          </button>
          <button
            onClick={() => {
              setEditing(false)
              setName(subject.name)
              setCode(subject.code ?? '')
              setError(null)
            }}
            className="text-xs border border-slate-300 text-slate-600 px-3 py-1.5 rounded font-medium"
          >
            Annuler
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className={`text-sm font-medium truncate ${subject.is_active ? 'text-slate-900' : 'text-slate-400'}`}>
          {subject.name}
        </p>
        {subject.code && <p className="text-xs text-slate-400">{subject.code}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!subject.is_active && (
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Archivee</span>
        )}
        <button
          onClick={() => setEditing(true)}
          className="text-xs border border-slate-300 text-slate-600 px-2 py-1 rounded"
        >
          Modifier
        </button>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="text-xs border border-slate-300 text-slate-600 px-2 py-1 rounded disabled:opacity-50"
        >
          {subject.is_active ? 'Archiver' : 'Reactiver'}
        </button>
      </div>
    </div>
  )
}
