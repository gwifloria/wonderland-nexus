"use client";
import { RouteIcon } from "@/components/SmartIcon";
import { toAbsPath } from "@/util/path";
import Link from "next/link";
import { useState } from "react";
import "./index.scss";
import { routes } from "./router";

const PageHeader = () => {
  const routesKeys = Object.keys(routes);
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Unified header: one nav for all sizes */}
      <nav
        className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur border-b border-mint-100/40 shadow-sm px-4 flex items-center justify-between rounded-b-2xl animate-navbarDrop"
        role="navigation"
        style={{ minHeight: "56px", paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Brand (always visible) */}
        <Link
          href="/"
          className="flex items-center gap-2 whitespace-nowrap text-2xl font-extrabold text-mint-500 tracking-tight select-none drop-shadow-sm hover:text-rose-400 transition-colors duration-200"
        >
          <img
            src="/icons/wonder-icon.png"
            alt="Wonder Icon"
            className="w-8 h-8 object-contain"
            aria-hidden="true"
          />
          <span>Wonderland</span>
        </Link>

        {/* Desktop links */}
        <div className="navigation-bar hidden md:flex whitespace-nowrap gap-2 sm:gap-4 md:gap-8 items-center">
          {routesKeys.map((route) => (
            <Link
              href={toAbsPath(route)}
              key={route}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-mint-800 text-sm md:text-lg font-mono font-semibold hover:bg-mint-100 hover:text-rose-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-mint-200"
            >
              <RouteIcon route={route} size={18} />
              <span>{route.charAt(0).toUpperCase() + route.slice(1)}</span>
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border border-neutral-300/80 bg-white/80 shadow-sm"
        >
          <span className="sr-only">Menu</span>
          <div className="relative w-5 h-3.5">
            <span
              className={`absolute left-0 top-0 h-[2px] w-5 bg-neutral-900 transition-transform ${open ? "rotate-45 translate-y-[7px]" : ""}`}
            />
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-[2px] w-5 bg-neutral-900 transition-opacity ${open ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute left-0 bottom-0 h-[2px] w-5 bg-neutral-900 transition-transform ${open ? "-rotate-45 -translate-y-[7px]" : ""}`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div
          className="absolute inset-0 bg-black/20"
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-[78%] max-w-[320px] bg-[#f9f4ee]/95 backdrop-blur border-l border-neutral-200 shadow-xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="h-[56px] flex items-center px-4 justify-between">
            <Link
              href="/"
              className="font-serif text-center text-lg flex items-center gap-2"
            >
              <img
                src="/icons/wonder-icon.png"
                alt="Wonder Icon"
                className="w-6 h-6 object-contain"
                aria-hidden="true"
              />
              Wonderland
            </Link>
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-lg border border-neutral-300/70 bg-white/80"
            >
              ✕
            </button>
          </div>
          <nav className="p-4 pt-2">
            <ul className="grid gap-1 text-[15px]">
              {routesKeys.map((route) => (
                <li key={route}>
                  <Link
                    href={toAbsPath(route)}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-neutral-50 text-mint-900 transition-colors"
                  >
                    <span className="flex-shrink-0">
                      <RouteIcon route={route} size={18} />
                    </span>
                    <span className="flex-1">
                      {route.charAt(0).toUpperCase() + route.slice(1)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      <style>{`
        @keyframes navbarDrop { 0% { opacity: 0; transform: translateY(-24px) scale(0.98); } 100% { opacity: 1; transform: none; } }
        .animate-navbarDrop { animation: navbarDrop 0.7s cubic-bezier(.4,1.6,.6,1); }
      `}</style>
    </>
  );
};
export default PageHeader;
