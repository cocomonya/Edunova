'use client'

import { useRouter } from 'next/navigation'

interface ClasseOption {
  id: string
  niveau: string
  local: string | null
}

export default function ClassFilter({
  classes,
  currentClasse,
}: {
  classes: ClasseOption[]
  currentClasse: string
}) {
  const router = useRouter()

  return (
    <select
      defaultValue={currentClasse}
      onChange={(e) => {
        const val = e.target.value
        router.push(val ? `/eleves?classe=${val}` : '/eleves')
      }}
      className="border border-slate-300 rounded px-3 py-2 text-sm bg-white"
    >
      <option value="">Toutes les classes</option>
      {classes.map((c) => (
        <option key={c.id} value={c.id}>
          {c.niveau}{c.local ? ` - Local ${c.local}` : ''}
        </option>
      ))}
    </select>
  )
}
