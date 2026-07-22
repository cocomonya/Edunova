'use client'

import { useActionState } from 'react'
import { login, type LoginState } from './actions'

const initialState: LoginState = {}

export default function ConnexionPage() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-4 font-bold text-lg text-slate-900">
            E
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">EduNova</h1>
          <p className="text-sm text-slate-500 mt-1">Connexion à votre espace</p>
        </div>

        <form action={formAction} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          {state.error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {pending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Pas de compte ? EduNova fonctionne uniquement sur invitation — contactez
          la direction de votre établissement.
        </p>
      </div>
    </div>
  )
}
