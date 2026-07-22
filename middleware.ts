import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ROLE_ROUTES: Record<string, string[]> = {
  directeur: ['/tableau-de-bord', '/eleves', '/finances', '/utilisateurs', '/rapports', '/parametres'],
  secretaire: ['/tableau-de-bord', '/eleves', '/utilisateurs', '/rapports'],
  comptable: ['/tableau-de-bord', '/finances', '/rapports'],
  enseignant: ['/tableau-de-bord', '/eleves', '/notes'],
  parent: ['/tableau-de-bord', '/notes'],
}

const PUBLIC_ROUTES = ['/connexion', '/inscription', '/mot-de-passe-oublie', '/erreur-acces', '/acces-refuse']

interface CustomClaims {
  app_role?: string
  school_id?: string
  permissions?: string[]
}

function decodeJwtClaims(accessToken: string): CustomClaims {
  try {
    const payload = accessToken.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return {
      app_role: decoded.app_role,
      school_id: decoded.school_id,
      permissions: decoded.permissions,
    }
  } catch {
    return {}
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const redirectUrl = new URL('/connexion', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const claims = decodeJwtClaims(session.access_token)
  console.log('DEBUG claims:', JSON.stringify(claims), 'pathname:', pathname)

  if (!claims.school_id || !claims.app_role) {
    return NextResponse.redirect(
      new URL('/erreur-acces?raison=profil-incomplet', request.url)
    )
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/tableau-de-bord', request.url))
  }

  const allowedRoutes = ROLE_ROUTES[claims.app_role]

  if (!allowedRoutes) {
    return NextResponse.redirect(new URL('/erreur-acces?raison=role-inconnu', request.url))
  }

  const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route))

  if (!isAllowed) {
    return NextResponse.redirect(new URL('/acces-refuse', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
