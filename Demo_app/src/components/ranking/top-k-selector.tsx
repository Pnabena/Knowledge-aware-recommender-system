import type { TopK } from "@/types/ranking";

export function TopKSelector({ value, onChange }: { value: TopK; onChange: (value: TopK) => void }) {
  return <div className="top-k-selector" role="group" aria-label="Number of results per ranking">
    {([5, 10, 20] as const).map((count) => <button type="button" key={count} aria-pressed={value === count} onClick={() => onChange(count)}>Show {count}</button>)}
  </div>;
}
