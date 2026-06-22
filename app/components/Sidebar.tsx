"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconGrid,
  IconImage,
  IconMeta,
  IconProgrammatic,
  IconTv,
  IconChevron,
} from "./icons";

const NAV = [
  { href: "/", label: "Visão Geral", Icon: IconGrid },
  { href: "/meta", label: "Meta Ads", Icon: IconMeta },
  { href: "/ctv", label: "CTV · Smart TV", Icon: IconTv },
  { href: "/programatica", label: "Programática", Icon: IconProgrammatic },
  { href: "/criativos", label: "Criativos", Icon: IconImage },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1.5">
      {NAV.map(({ href, label, Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
              active
                ? "bg-terracotta text-white shadow-[0_8px_20px_-8px_rgba(165,55,30,0.7)]"
                : "text-white/85 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="px-2">
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-ochre text-forest font-black text-lg shadow-inner">
          S
        </div>
        <div className="leading-none">
          <div className="font-black tracking-tight text-white text-[15px]">
            SISTEMATIZAÊ
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/70 mt-1">
            Painel de Mídia
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 grid h-11 w-11 place-items-center rounded-2xl bg-forest text-cream shadow-lg"
        aria-label="Abrir menu"
      >
        <IconChevron className="h-5 w-5 -rotate-90" />
      </button>

      {/* Desktop floating sidebar */}
      <aside className="hidden md:flex fixed left-4 top-4 bottom-4 z-30 w-[224px] flex-col justify-between rounded-[28px] bg-forest p-4 shadow-[0_24px_60px_-30px_rgba(30,70,54,0.8)] overflow-hidden">
        <PatternBg />
        <div className="relative z-10 flex flex-col gap-7">
          <Brand />
          <NavList />
        </div>
        <Footer />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-3 top-3 bottom-3 w-[240px] flex flex-col justify-between rounded-[28px] bg-forest p-4 shadow-2xl overflow-hidden">
            <PatternBg />
            <div className="relative z-10 flex flex-col gap-7">
              <Brand />
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <Footer />
          </aside>
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <div className="relative z-10 rounded-2xl bg-white/10 px-3.5 py-3 text-white/85">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/70">
        Governo da Bahia
      </div>
      <div className="text-[11px] mt-0.5 font-semibold text-white">SECOM</div>
    </div>
  );
}

/** Subtle Afro-Brazilian inspired pattern in the sidebar background. */
function PatternBg() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.07] text-ochre"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id="bahia"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(20)"
        >
          <circle cx="10" cy="10" r="3" fill="currentColor" />
          <path
            d="M0 30 Q10 20 20 30 T40 30"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bahia)" />
    </svg>
  );
}
