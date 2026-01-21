import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Menu } from 'lucide-react'
import { NavLinksDesktop } from './NavLinks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const avatarUrl = (user?.user_metadata as any)?.avatar_url as string | undefined
  const fallback = (user?.email?.[0] || 'U').toUpperCase()

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-0">
        <div className="flex items-center gap-2">
          <Link href="/homepage" className="text-2xl font-bold text-primary">PlainLaw</Link>
        </div>

        {/* Desktop nav */}
        <NavLinksDesktop />

        <div className="flex items-center gap-1">
          {/* Mobile nav menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </DropdownMenuTrigger>@
              <DropdownMenuContent align="end" className="w-48">
                <Link href="/homepage"><DropdownMenuItem>Upload</DropdownMenuItem></Link>
                <Link href="/contracts"><DropdownMenuItem>Contracts</DropdownMenuItem></Link>
                <Link href="/settings"><DropdownMenuItem>Settings</DropdownMenuItem></Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Profile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open profile menu">
                <Avatar>
                  <AvatarImage src={avatarUrl} alt={user?.email ?? 'User'} />
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Profile</span>
                  {user?.email && (
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/settings"><DropdownMenuItem>Settings</DropdownMenuItem></Link>
              <DropdownMenuSeparator />
              <form action="/signout" method="POST">
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full text-left">Sign Out</button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
