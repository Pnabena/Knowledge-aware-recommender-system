"use client";

export default function DatasetError({ reset }: { reset: () => void }) {
  return <main className="empty-state"><h1 className="text-2xl font-semibold">Recommendations are unavailable</h1><p>The dataset service could not load this page. Please try again when it is available.</p><button onClick={reset}>Try again</button></main>;
}
