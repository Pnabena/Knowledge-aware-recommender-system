"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useDiscoveryState } from "./discovery-state";
import { LocationDropdown } from "./location-dropdown";

export function Header({ query = "" }: { query?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setView } = useDiscoveryState();
  const [value, setValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelSearch = () => {
    setValue("");
    setView("home");
    if (pathname !== "/") router.push("/");
    else inputRef.current?.focus();
  };
  return (
    <header className="top-header">
      <form role="search" className={`search-field ${query ? "search-field-results" : ""}`} onSubmit={(event) => {
        event.preventDefault();
        const nextQuery = value.trim();
        setValue(nextQuery);
        setView("home");
        if (nextQuery) router.push(`/search?${new URLSearchParams({ q: nextQuery }).toString()}`);
        else cancelSearch();
      }}>
        <Search aria-hidden="true" size={23} strokeWidth={1.8} />
        <input ref={inputRef} name="q" aria-label="Find restaurants" placeholder="Find Restaurants" enterKeyHint="search" autoComplete="off" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); cancelSearch(); } }} />
        {(value || query) && <button type="button" className="clear-search" aria-label="Clear search and return to For You" onClick={cancelSearch}><X size={17} /></button>}
      </form>
      <LocationDropdown />
      <div className="profile-control" aria-label="Demo profile: P">
        <span className="avatar">P</span><ChevronDown aria-hidden="true" size={19} />
      </div>
    </header>
  );
}
