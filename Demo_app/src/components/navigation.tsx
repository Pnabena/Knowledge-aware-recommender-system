"use client";

import { Home, PanelsTopLeft, Settings } from "lucide-react";
import { BrandMark } from "./brand-mark";

export type FeedView = "home" | "saved";

export function Navigation({ view, onViewChange }: { view: FeedView; onViewChange: (view: FeedView) => void }) {
  return (
    <aside className="navigation-rail">
      <button className="brand-link" aria-label="Local Table home" onClick={() => onViewChange("home")}><BrandMark /></button>
      <nav aria-label="Main navigation" className="main-nav">
        <button className={`nav-button ${view === "home" ? "is-active" : ""}`} aria-label="Home" aria-current={view === "home" ? "page" : undefined} title="Home" onClick={() => onViewChange("home")}><Home size={27} strokeWidth={1.9} /></button>
        <button className={`nav-button ${view === "saved" ? "is-active" : ""}`} aria-label="Saved places" aria-current={view === "saved" ? "page" : undefined} title="Saved places" onClick={() => onViewChange("saved")}><PanelsTopLeft size={27} strokeWidth={1.9} /></button>
      </nav>
      <button className="nav-button settings-button" aria-label="Settings (coming soon)" title="Settings coming soon" disabled><Settings size={28} strokeWidth={1.9} /></button>
    </aside>
  );
}
