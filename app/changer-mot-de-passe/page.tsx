import ChangePasswordForm from './change-password-form'

export default function ChangerMotDePassePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="max-w-sm w-full">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Changement de mot de passe requis</h1>
        <p className="text-sm text-slate-500 mb-6">
          Choisissez un nouveau mot de passe personnel pour continuer.
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  )
}
