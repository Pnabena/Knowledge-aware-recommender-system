"use client";

export default function DatasetError({ reset }: { reset: () => void }) {
  return <main className="empty-state"><h1 className="text-2xl font-semibold">Recommendations are unavailable</h1><p>The bundled demo data could not be loaded. Please reload the page or try again.</p><button onClick={reset}>Try again</button></main>;
}
