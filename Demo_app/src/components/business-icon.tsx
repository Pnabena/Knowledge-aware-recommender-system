import Image from "next/image";

/** A category badge, not a business photo. Accepts feed IDs or API category labels. */
export function BusinessIcon({ categories = [], className = "" }: { categories?: readonly string[]; className?: string }) {
  const category = categories.join(" ").toLowerCase();
  const icon = /bakery|bakeries|patisserie/.test(category) ? "bakery"
    : /fine.?dining/.test(category) ? "dining"
    : /pub|beer/.test(category) ? "pub"
    : /wine|bar|nightlife|cocktail/.test(category) ? "bar"
    : /fast.food|burger/.test(category) ? "fast-food"
    : /cafe|café|coffee|brunch|breakfast/.test(category) ? "cafe"
    : "dining";
  return <span className={`business-icon ${className}`} aria-hidden="true"><Image src={`/icons/${icon}.svg`} alt="" width={94} height={94} /></span>;
}
