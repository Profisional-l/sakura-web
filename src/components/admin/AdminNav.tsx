"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/feed", label: "Feed Builder" },
  { href: "/admin/media", label: "Media Library" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="glass-panel px-6 py-4 mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-6">
        {ADMIN_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors hover:text-[var(--color-accent)] ${
              pathname === link.href ? "text-[var(--color-accent)]" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="text-sm text-white/60 hover:text-white transition-colors"
      >
        Sign Out
      </button>
    </nav>
  );
}
