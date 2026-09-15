import { BusinessIcon } from "../business-icon";

export function MissingVisualState({ evidence = false }: { evidence?: boolean }) {
  return <div className={`missing-visual-state ${evidence ? "is-evidence" : ""}`}>
    <span className="missing-visual-mark"><BusinessIcon /></span>
    <h3>{evidence ? "Visual evidence unavailable" : "No visual information available"}</h3>
    <p>{evidence ? "This business had no genuine image representation. The visual branch was therefore masked." : "There are no business images to show here yet."}</p>
  </div>;
}
