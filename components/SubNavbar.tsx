"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  Layers,
  FileText,
  ShieldCheck,
  Briefcase,
  Activity,
  Cpu,
  Building2,
  GraduationCap,
  ArrowLeft,
  ChevronRight,
  SlidersHorizontal,
  PlusCircle,
  ExternalLink,
  Download,
  Filter,
  Terminal,
} from "lucide-react";
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SubNavbar() {
  const pathname = usePathname();

  // Determine subnav configuration based on current route
  const getSubNavConfig = () => {
    if (pathname === "/") {
      return {
        label: "Platform",
        icon: Cpu,
        links: [
          { name: "Overview", href: "#hero" },
          { name: "Platform Features", href: "#features" },
          { name: "Guided Architecture", href: "#architecture-flow" },
          { name: "Early Access", href: "#cta-section" },
        ],
        badge: "v1.4 Engine",
        action: {
          name: "Launch Scout",
          href: "/ai-scout",
          icon: Sparkles,
        },
      };
    }

    if (pathname.startsWith("/explore")) {
      return {
        label: "Discovery Matrix",
        icon: Compass,
        links: [
          { name: "All Entities", href: "/explore" },
          { name: "Technologies", href: "/explore?type=technology" },
          { name: "Startups", href: "/explore?type=startup" },
          { name: "Domain Experts", href: "/explore?type=expert" },
        ],
        badge: "48 Verified Assets",
        action: {
          name: "Add Entity",
          href: "/admin",
          icon: PlusCircle,
        },
      };
    }

    if (pathname.startsWith("/challenges")) {
      return {
        label: "Innovation Challenges",
        icon: Briefcase,
        links: [
          { name: "All Challenges", href: "/challenges" },
          { name: "Open Pilots", href: "/challenges#open" },
          { name: "R&D Grants", href: "/challenges#grants" },
          { name: "Tech Transfer", href: "/challenges#licensing" },
        ],
        badge: "€1.8M Active Pool",
        action: {
          name: "Submit Proposal",
          href: "/challenges",
          icon: PlusCircle,
        },
      };
    }

    if (pathname.startsWith("/reports")) {
      return {
        label: "Research Briefs",
        icon: FileText,
        links: [
          { name: "All Publications", href: "/reports" },
          { name: "Market Maps", href: "/reports#market-maps" },
          { name: "Deep Tech", href: "/reports#deep-tech" },
          { name: "Standards", href: "/reports#standards" },
        ],
        badge: "Quarterly Intelligence",
        action: {
          name: "Request Brief",
          href: "/reports",
          icon: Sparkles,
        },
      };
    }

    if (pathname.startsWith("/ai-scout")) {
      return {
        label: "AI Scout",
        icon: Sparkles,
        links: [
          { name: "Architecture Scout", href: "/ai-scout" },
          { name: "Feasibility Assessment", href: "/ai-scout" },
          { name: "Ecosystem Topology", href: "/ai-scout" },
        ],
        badge: "Gemini 3.5 Engine",
        action: {
          name: "Reset Query",
          href: "/ai-scout",
          icon: Terminal,
        },
      };
    }

    if (pathname.startsWith("/dashboard")) {
      return {
        label: "Workspace",
        icon: Activity,
        links: [
          { name: "Overview", href: "/dashboard" },
          { name: "Architectural Drafts", href: "/dashboard#drafts" },
          { name: "Active Pipelines", href: "/dashboard#pipelines" },
          { name: "Telemetry", href: "/dashboard#telemetry" },
        ],
        badge: "Production Tier",
        action: {
          name: "New Project",
          href: "/dashboard",
          icon: PlusCircle,
        },
      };
    }

    if (pathname.startsWith("/admin")) {
      return {
        label: "Curator Console",
        icon: ShieldCheck,
        links: [
          { name: "Submissions Queue", href: "/admin" },
          { name: "Directory Management", href: "/admin#directory" },
          { name: "Verification Gates", href: "/admin#gates" },
          { name: "Audit Trail", href: "/admin#audit" },
        ],
        badge: "Admin Access",
        action: {
          name: "Export Logs",
          href: "/admin",
          icon: Download,
        },
      };
    }

    if (
      pathname.startsWith("/technology") ||
      pathname.startsWith("/startup") ||
      pathname.startsWith("/expert")
    ) {
      return {
        label: "Entity Profile",
        icon: Cpu,
        links: [
          { name: "Overview", href: "#overview" },
          { name: "Technical Specifications", href: "#specs" },
          { name: "Milestones & Trl", href: "#milestones" },
          { name: "Integration Guide", href: "#integration" },
        ],
        badge: "Detailed Specs",
        action: {
          name: "Explore Directory",
          href: "/explore",
          icon: ArrowLeft,
        },
      };
    }

    // Default fallback
    return {
      label: "Navigation",
      icon: Layers,
      links: [
        { name: "Home", href: "/" },
        { name: "Discovery", href: "/explore" },
        { name: "Challenges", href: "/challenges" },
        { name: "AI Scout", href: "/ai-scout" },
      ],
      badge: "NEXORA",
      action: {
        name: "Dashboard",
        href: "/dashboard",
        icon: Activity,
      },
    };
  };

  const config = getSubNavConfig();
  const IconComponent = config.icon;
  const ActionIcon = config.action.icon;

  return (
    <div className="sticky top-16 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11 gap-4 overflow-hidden">
          {/* Left Context Label & Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 text-cyan-400 font-medium font-mono">
              <IconComponent className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline text-neutral-200 font-semibold tracking-wide">
                {config.label}
              </span>
            </div>

            <span className="hidden md:inline-block w-1 h-1 rounded-full bg-neutral-700" />

            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
              {config.badge}
            </span>
          </div>

          {/* Center Page-Specific Option Links (Scrollable on small screens) */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
            {config.links.map((link, idx) => {
              const isFirst = idx === 0;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-2.5 py-1 rounded-md whitespace-nowrap transition-all text-[11px] font-medium",
                    isFirst
                      ? "text-neutral-100 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Page-Specific Action */}
          <div className="flex items-center shrink-0">
            <Link
              href={config.action.href}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors text-[11px] font-medium shadow-sm whitespace-nowrap"
            >
              <ActionIcon className="w-3 h-3 text-cyan-400" />
              <span>{config.action.name}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
