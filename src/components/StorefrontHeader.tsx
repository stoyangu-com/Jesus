/**
 * StorefrontHeader.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Reconstructed from StorefrontChrome.tsx inside the production bundle
 * (assets/index-BwoJQEw7.js — functions `iw` and `_v`). Cleaned up and
 * renamed for readability; structure, classes, and behaviour match the
 * original: announcement bar → scroll-progress bar → sticky header with
 * logo, centered nav, and a primary CTA button, plus a mobile layout.
 *
 * Requires stoyangu-design-tokens.css to be loaded globally, and
 * Tailwind CSS available (or port the classes to your own CSS).
 * Uses your router's Link — swap `Link`/`useNavigate` for your framework
 * if not React Router.
 * ─────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export interface AnnouncementConfig {
  primary: string;
  secondary?: string;
  height?: string;
  background?: string;
  textColour?: string;
  mobilePrimaryOnly?: boolean;
}

export interface HeaderConfig {
  logoUrl?: string;
  wordmark?: string;
  markText?: string;
  markBackground?: string;
  markTextColour?: string;
  shopLabel?: string;
  nav?: { label: string; target: string }[];
}

export interface StorefrontEngineLike {
  header: HeaderConfig;
  announcement?: AnnouncementConfig;
  sections: { kind: string; key: string; navLabel: string }[];
}

/** The circular/rounded logo "mark" used when no logoUrl image is set —
 *  first letter of the store name on a colored rounded-square background,
 *  set in the accent serif font, italic. Falls back to an <img> if a real
 *  logo URL is provided. */
function LogoMark({
  engine,
  storeName,
}: {
  engine: StorefrontEngineLike;
  storeName: string;
}) {
  const { header } = engine;
  const logoUrl = header.logoUrl;

  if (logoUrl && (/^https?:\/\//i.test(logoUrl) || logoUrl.startsWith("data:"))) {
    return (
      <img
        src={logoUrl}
        alt={storeName}
        className="h-11 sm:h-14 w-auto max-w-[200px] object-contain object-left"
      />
    );
  }

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-lg font-medium"
        style={{
          background: header.markBackground || "var(--sy-primary)",
          color: header.markTextColour || "#fff",
          borderRadius: "14px 18px 12px 16px",
          fontFamily: "var(--sy-font-accent)",
          fontStyle: "italic",
        }}
      >
        {(header.markText || storeName || "S").charAt(0)}
      </div>
      <div
        className="font-extrabold tracking-[-0.04em] text-[17px] sm:text-[20px] truncate"
        style={{ color: "var(--sy-ink)", fontFamily: "var(--sy-font-display)" }}
      >
        {header.wordmark || storeName}
      </div>
    </div>
  );
}

/** Scrolls a section into view smoothly by element id. */
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function StorefrontHeader({
  homeUrl,
  engine,
  storeName,
  logoUrl,
  /** "store" scrolls to in-page sections; "product" navigates back to
   *  the store's homeUrl + #section instead. */
  mode = "store",
}: {
  /** URL of the storefront's own homepage — used for the logo link and
   *  for product-page nav that needs to jump back with a hash. */
  homeUrl: string;
  engine: StorefrontEngineLike;
  storeName: string;
  logoUrl?: string;
  mode?: "store" | "product";
}) {
  if (logoUrl && !engine.header.logoUrl) engine.header.logoUrl = logoUrl;

  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  const navItems = engine.header.nav?.length
    ? engine.header.nav
    : engine.sections
        .filter((s) => s.kind !== "custom")
        .map((s) => ({ label: s.navLabel, target: s.key }));

  const goTo = (target: string) => {
    const id = String(target || "").replace(/^#/, "");
    setMobileOpen(false);
    if (mode === "product") {
      navigate(`${homeUrl}#${id}`);
      return;
    }
    scrollToSection(id);
  };

  // Thin progress bar across the very top, tracking scroll depth.
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setScrollPct(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const announcement = engine.announcement;

  return (
    <>
      {announcement && (
        <div
          className="w-full flex items-center justify-center gap-2 px-3 text-[11px] sm:text-[12px] font-semibold tracking-wide"
          style={{
            minHeight: announcement.height || "34px",
            background: announcement.background || "var(--sy-primary-dark)",
            color: announcement.textColour || "#fff",
          }}
        >
          <span className="text-center">{announcement.primary}</span>
          {announcement.secondary && (
            <>
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  announcement.mobilePrimaryOnly ? "hidden sm:inline-block" : "inline-block"
                }`}
                style={{ background: "var(--sy-accent)" }}
                aria-hidden
              />
              <span
                className={announcement.mobilePrimaryOnly ? "hidden sm:inline" : "inline"}
              >
                {announcement.secondary}
              </span>
            </>
          )}
        </div>
      )}

      {/* Scroll progress indicator */}
      <div
        className="fixed top-0 left-0 z-[70] pointer-events-none"
        style={{ width: `${scrollPct}%`, height: "3px", background: "var(--sy-primary)" }}
        aria-hidden
      />

      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "color-mix(in srgb, var(--sy-white) 92%, transparent)",
          borderColor: "var(--sy-border)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Desktop layout: logo | centered nav | CTA */}
        <div
          className="hidden md:grid max-w-[1400px] mx-auto py-3.5 grid-cols-[1fr_auto_1fr] items-center gap-4"
          style={{ paddingLeft: "var(--sy-space-gutter)", paddingRight: "var(--sy-space-gutter)" }}
        >
          <Link to={homeUrl} className="justify-self-start">
            <LogoMark engine={engine} storeName={storeName} />
          </Link>

          <nav className="justify-self-center flex items-center gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.target + item.label}
                type="button"
                onClick={() => goTo(item.target)}
                className="px-4 py-2.5 text-[13px] font-semibold sy-nav-btn"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="justify-self-end">
            <button type="button" className="sy-btn sy-btn-primary" onClick={() => goTo("products")}>
              {engine.header.shopLabel || "Shop Now"}
            </button>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden px-3 py-2.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <Link to={homeUrl} className="flex-1 min-w-0">
              <LogoMark engine={engine} storeName={storeName} />
            </Link>
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--sy-primary-soft)", color: "var(--sy-primary)" }}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>

          {mobileOpen && (
            <nav className="flex flex-col gap-1 pt-1">
              {navItems.map((item) => (
                <button
                  key={item.target + item.label}
                  type="button"
                  onClick={() => goTo(item.target)}
                  className="text-left px-4 py-3 text-[14px] font-semibold sy-nav-btn"
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                className="sy-btn sy-btn-primary mt-2 w-full"
                onClick={() => goTo("products")}
              >
                {engine.header.shopLabel || "Shop Now"}
              </button>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
