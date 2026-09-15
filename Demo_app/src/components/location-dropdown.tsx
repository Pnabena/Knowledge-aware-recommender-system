"use client";

import { Check, ChevronDown, MapPin } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { usLocations } from "@/data/locations";
import { useDiscoveryState } from "./discovery-state";

export function LocationDropdown() {
  const { locationId, setLocationId } = useDiscoveryState();
  const selectedIndex = usLocations.findIndex((location) => location.id === locationId);
  const selected = usLocations[selectedIndex];
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ value: "", time: 0 });
  const id = useId();

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus({ preventScroll: true });
    const closeOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const close = () => { setOpen(false); triggerRef.current?.focus(); };
  const select = (index: number) => { setLocationId(usLocations[index].id); close(); };
  const show = () => { setActiveIndex(selectedIndex); typeahead.current.value = ""; setOpen(true); };
  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const { key } = event;
    if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"].includes(key)) event.preventDefault();
    if (key === "Escape") close();
    else if (key === "Enter" || key === " ") select(activeIndex);
    else if (key === "ArrowDown") setActiveIndex((index) => (index + 1) % usLocations.length);
    else if (key === "ArrowUp") setActiveIndex((index) => (index - 1 + usLocations.length) % usLocations.length);
    else if (key === "Home") setActiveIndex(0);
    else if (key === "End") setActiveIndex(usLocations.length - 1);
    else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = event.timeStamp;
      const value = (now - typeahead.current.time < 700 ? typeahead.current.value : "") + key.toLowerCase();
      typeahead.current = { value, time: now };
      const match = usLocations.findIndex((location) => location.city.toLowerCase().startsWith(value));
      if (match >= 0) setActiveIndex(match);
    }
  };

  return <div className="location-picker" ref={containerRef} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={triggerRef} type="button" className="location-control" aria-label={`Choose location, currently ${selected.city}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined}
      onClick={() => open ? close() : show()} onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); show(); }
      }}>
      <MapPin aria-hidden="true" size={20} className="location-pin" />
      <span>{selected.city}</span><ChevronDown aria-hidden="true" size={15} className="location-chevron" />
    </button>
    {open && <div className="location-popover">
      <div className="location-menu-heading" id={`${id}-heading`}>Choose your city<span>United States</span></div>
      <ul ref={listRef} id={`${id}-list`} role="listbox" tabIndex={0} aria-labelledby={`${id}-heading`} aria-describedby={`${id}-note`} aria-activedescendant={`${id}-${activeIndex}`} className="location-options" onKeyDown={onKeyDown}>
        {usLocations.map((location, index) => <li key={location.id} id={`${id}-${index}`} role="option" aria-selected={locationId === location.id} className={`location-option ${activeIndex === index ? "is-active" : ""}`} onClick={() => select(index)}>
          <span>{location.city}<small>{location.state}</small></span>
          {locationId === location.id && <Check size={17} aria-hidden="true" />}
        </li>)}
      </ul>
      <p id={`${id}-note`} className="location-menu-note">City preference only. This frozen dataset contains New Orleans recommendations.</p>
    </div>}
  </div>;
}
