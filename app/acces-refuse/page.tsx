import Link from 'next/link'

export default function AccesRefusePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-lg font-semibold text-slate-900 mb-2">Accès refusé</h1>
        <p className="text-sm text-slate-500 mb-6">
          Votre rôle ne permet pas d&apos;accéder à cette section.
        </p>
        <Link
          href="/tableau-de-bord"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 text-white inline-block hover:bg-slate-800 transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
