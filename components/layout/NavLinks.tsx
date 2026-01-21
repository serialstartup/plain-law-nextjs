"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function NavLinksDesktop() {
  const pathname = usePathname()

  const links = [
    { href: "/homepage", label: "Upload" },
    { href: "/contracts", label: "Contracts" },
    { href: "/settings", label: "Settings" },
  ]

  return (
    <div className="hidden md:flex items-center gap-1 lg:gap-2">
      {links.map((l) => {
        const active = pathname?.startsWith(l.href)
        return (
          <Link key={l.href} href={l.href}>
            <Button
              variant="ghost"
              className={cn(
                active && "bg-accent text-accent-foreground"
              )}
            >
              {l.label}
            </Button>
          </Link>
        )
      })}
    </div>
  )
}

