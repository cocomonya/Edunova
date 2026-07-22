import Link from 'next/link'

export default async function ErreurAccesPage({
  searchParams,
}: {
  searchParams: Promise<{ raison?: string }>
}) {
  const { raison } = await searchParams

  const messages: Record<string, string> = {
    'profil-incomplet':
      "Votre profil n'est pas encore complètement configuré (rôle ou école manquant). Contactez la direction de votre établissement.",
    'role-inconnu':
      "Votre rôle n'est pas reconnu par le système. Contactez la direction de votre établissement.",
  }

  const message = messages[raison ?? ''] ?? 'Un problème empêche votre accès au compte.'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-lg font-semibold text-slate-900 mb-2">Accès impossible</h1>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <Link
          href="/connexion"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 text-white inline-block hover:bg-slate-800 transition-colors"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
