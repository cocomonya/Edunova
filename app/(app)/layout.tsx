import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Nav from './nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, roles ( slug, name )')
    .eq('id', userData.user.id)
    .single()

  const roleSlug = (profile?.roles as any)?.slug as string | undefined
  const roleName = (profile?.roles as any)?.name as string | undefined

  return (
    <>
      <Nav roleSlug={roleSlug} roleName={roleName} fullName={profile?.full_name} />
      {children}
    </>
  )
}
