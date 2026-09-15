"use client";

import type { Category } from "@/types/business";

export function CategoryTabs({ categories, selected, onSelect }: { categories: Category[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <nav className="category-tabs" aria-label="Restaurant categories">
      {categories.map((category) => (
        <button key={category.id} className={`category-tab ${selected === category.id ? "selected" : ""}`} aria-pressed={selected === category.id} onClick={(event) => {
          onSelect(category.id);
          event.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }}>{category.label}</button>
      ))}
    </nav>
  );
}
