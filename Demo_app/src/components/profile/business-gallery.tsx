"use client";

import Image from "next/image";
import { useState } from "react";
import type { BusinessProfile } from "@/types/explanation";
import { MissingVisualState } from "@/components/explanation/missing-visual-state";

export function BusinessGallery({ business }: { business: BusinessProfile }) {
  const [selected, setSelected] = useState(0);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const images = business.imageAvailable ? business.images.filter((image) => !failedUrls.includes(image.url)) : [];
  const current = images[Math.min(selected, images.length - 1)];
  if (!current) return <div className="profile-gallery profile-gallery-missing"><MissingVisualState /></div>;
  return <div className="profile-gallery">
    <div className="profile-hero-image"><Image src={current.url} alt={current.alt} fill sizes="(max-width: 899px) 95vw, 55vw" priority className="object-cover" onError={() => setFailedUrls((urls) => [...urls, current.url])} /><span className="profile-photo-label">{current.label}</span></div>
    {images.length > 1 && <div className="profile-thumbnails" aria-label="Business photos">{images.map((image, index) => <button key={image.url} type="button" aria-label={`Show ${image.label.toLowerCase()} photo ${index + 1}`} aria-pressed={current.url === image.url} onClick={() => setSelected(index)}><Image src={image.url} alt="" fill sizes="160px" className="object-cover" /></button>)}</div>}
    <p className="profile-image-note">{business.source === "mock" ? "Illustrative demo photography" : `${images.length} business ${images.length === 1 ? "photo" : "photos"}`}</p>
  </div>;
}
