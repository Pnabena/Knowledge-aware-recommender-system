"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { FeedView } from "./navigation";
import { defaultLocationId, type LocationId } from "@/data/locations";
import type { Business } from "@/types/business";

interface DiscoveryState {
  view: FeedView;
  setView: Dispatch<SetStateAction<FeedView>>;
  savedIds: Set<string>;
  savedBusinesses: Map<string, Business>;
  toggleSave: (id: string, business?: Business) => void;
  locationId: LocationId;
  setLocationId: Dispatch<SetStateAction<LocationId>>;
}

const DiscoveryContext = createContext<DiscoveryState | null>(null);

/** Lives in the shared layout so visiting Search does not discard session-only saves. */
export function DiscoveryStateProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<FeedView>("home");
  const [locationId, setLocationId] = useState<LocationId>(defaultLocationId);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedBusinesses, setSavedBusinesses] = useState<Map<string, Business>>(new Map());
  const toggleSave = (id: string, business?: Business) => {
    if (business) setSavedBusinesses((previous) => new Map(previous).set(id, business));
    setSavedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  return <DiscoveryContext.Provider value={{ view, setView, savedIds, savedBusinesses, toggleSave, locationId, setLocationId }}>{children}</DiscoveryContext.Provider>;
}

export function useDiscoveryState() {
  const context = useContext(DiscoveryContext);
  if (!context) throw new Error("Discovery components require DiscoveryStateProvider.");
  return context;
}
