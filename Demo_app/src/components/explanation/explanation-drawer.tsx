"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import type { BusinessExplanation } from "@/types/explanation";
import { ExplanationOverview, TextEvidence, VisualEvidence, ModelBehaviour } from "./evidence-panels";
import { KnowledgeGraphEvidence } from "./knowledge-graph-evidence";

const tabs = ["Overview", "Knowledge Graph", "Text Evidence", "Visual Evidence", "Model Behaviour"] as const;

export function ExplanationDrawer({ explanation, open, onClose, detailedEvidenceAvailable = true }: { explanation: BusinessExplanation; open: boolean; onClose: () => void; detailedEvidenceAvailable?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const scrollArea = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element || !open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => { element.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [open]);
  const changeTab = (index: number) => { setActive(index); scrollArea.current?.scrollTo({ top: 0 }); };
  return <dialog ref={dialog} className="explanation-dialog" aria-labelledby="explanation-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="explanation-shell">
      <header className="explanation-header"><div><span className="explanation-heading-icon"><Sparkles size={18} aria-hidden="true" /></span><span><h2 id="explanation-title">Why this place?</h2><p>{explanation.business.name}</p></span></div><button autoFocus className="explanation-close" aria-label="Close explanation" onClick={onClose}><X size={21} /></button></header>
      <div className="explanation-provenance"><span>{explanation.notebookCase ? "Notebook case" : "Frozen-model evidence"} · User {explanation.userRow}</span><p>{detailedEvidenceAvailable ? "Evidence for the selected user and business" : "Ranks are available. Detailed evidence has not been exported for this user and business."}</p></div>
      <div className="explanation-tabs" role="tablist" aria-label="Recommendation evidence">{tabs.map((tab, index) => <button key={tab} id={`evidence-tab-${index}`} role="tab" aria-selected={active === index} aria-controls="evidence-tabpanel" tabIndex={active === index ? 0 : -1} onClick={() => changeTab(index)} onKeyDown={(event) => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault(); changeTab(next);
        const nextButton = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next];
        nextButton?.focus(); nextButton?.scrollIntoView({ block: "nearest", inline: "nearest" });
      }}>{tab}</button>)}</div>
      <div ref={scrollArea} id="evidence-tabpanel" role="tabpanel" aria-labelledby={`evidence-tab-${active}`} tabIndex={0} className="explanation-body">
        {active === 0 && <ExplanationOverview explanation={explanation} />}
        {active === 1 && <KnowledgeGraphEvidence explanation={explanation} />}
        {active === 2 && <TextEvidence explanation={explanation} />}
        {active === 3 && <VisualEvidence explanation={explanation} />}
        {active === 4 && <ModelBehaviour explanation={explanation} />}
      </div>
    </div>
  </dialog>;
}
