"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Hexagon, Shield, LogOut, User, Sparkles, KeyRound } from "lucide-react";
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/components/providers/AuthProvider";
import { ROLE_LABELS } from "@/lib/supabaseClient";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Challenges", href: "/challenges" },
  { name: "Reports", href: "/reports" },
  { name: "AI Scout", href: "/ai-scout" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Admin", href: "/admin" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, isAuthenticated, openAuthModal, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-neutral-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <Hexagon className="w-7 h-7 text-white group-hover:text-cyan-400 transition-colors" />
              <span className="text-xl font-bold tracking-widest text-white uppercase font-mono">
                Nexora
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-xs font-mono uppercase tracking-wider transition-colors hover:text-white",
                  pathname === link.href
                    ? "text-cyan-400 font-semibold drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                    : "text-neutral-400"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {profile && (
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-mono border uppercase tracking-wider",
                      profile.status === 'pending'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : ROLE_LABELS[profile.role]?.badge || 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    )}
                  >
                    {profile.status === 'pending' ? 'Pending Approval' : ROLE_LABELS[profile.role]?.label || profile.role}
                  </span>
                )}
                <button
                  onClick={() => signOut()}
                  className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="navbar-btn-login"
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 text-xs font-mono text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors uppercase tracking-wider"
                >
                  Sign In
                </button>
                <button
                  id="navbar-btn-request-access"
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 rounded-full transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:shadow-[0_0_20px_rgba(34,211,238,0.45)]"
                >
                  Request Access
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="block w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-neutral-950 border-b border-white/10">
          <div className="px-4 pt-2 pb-4 space-y-1 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-mono uppercase tracking-wider transition-colors",
                  pathname === link.href
                    ? "bg-neutral-800 text-cyan-400 font-semibold"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-neutral-800/80 flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-neutral-900 text-rose-300 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      openAuthModal('login');
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-neutral-900 text-neutral-200 text-xs font-mono uppercase tracking-wider text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      openAuthModal('signup');
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-cyan-500 text-neutral-950 font-bold text-xs font-mono uppercase tracking-wider text-center"
                  >
                    Request Access
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
