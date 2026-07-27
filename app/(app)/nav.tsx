'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS: Record<string, { href: string; label: string }[]> = {
  directeur: [
    { href: '/tableau-de-bord', label: 'Accueil' },
    { href: '/eleves', label: 'Eleves' },
    { href: '/classes', label: 'Classes' },
    { href: '/notes', label: 'Notes' },
    { href: '/utilisateurs', label: 'Utilisateurs' },
    { href: '/demandes', label: 'Demandes' },
  ],
  secretaire: [
    { href: '/tableau-de-bord', label: 'Accueil' },
    { href: '/eleves', label: 'Eleves' },
    { href: '/classes', label: 'Classes' },
    { href: '/notes', label: 'Notes' },
    { href: '/utilisateurs', label: 'Utilisateurs' },
  ],
  comptable: [
    { href: '/tableau-de-bord', label: 'Accueil' },
  ],
  enseignant: [
    { href: '/tableau-de-bord', label: 'Accueil' },
    { href: '/eleves', label: 'Eleves' },
    { href: '/notes', label: 'Notes' },
  ],
  parent: [
    { href: '/tableau-de-bord', label: 'Accueil' },
    { href: '/notes', label: 'Notes' },
  ],
}

export default function Nav({
  roleSlug,
  roleName,
  fullName,
}: {
  roleSlug?: string
  roleName?: string
  fullName?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const links = (roleSlug && NAV_LINKS[roleSlug]) || []

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/connexion')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-slate-200 relative">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <span className="text-sm font-semibold text-slate-900">EduNova</span>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="flex flex-col justify-center gap-1.5 w-8 h-8"
          >
            <span className={`block h-0.5 bg-slate-900 transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 bg-slate-900 transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-slate-900 transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="mb-3 pb-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900">{fullName}</p>
              <p className="text-xs text-slate-400">{roleName}</p>
            </div>
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-slate-700 py-2 px-2 rounded hover:bg-slate-50"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full text-sm px-3 py-2 rounded border border-slate-300 text-slate-600"
            >
              Deconnexion
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
