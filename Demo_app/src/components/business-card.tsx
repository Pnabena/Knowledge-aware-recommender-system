"use client";

import Image from "next/image";
import Link from "next/link";
import { profileHref } from "@/lib/profile-navigation";
import { Bookmark, Check, ChevronLeft, ChevronRight, MapPin, MoreHorizontal, Star } from "lucide-react";
import { useState } from "react";
import type { Business } from "@/types/business";
import { BusinessIcon } from "./business-icon";

export function BusinessCard({ business, saved, onToggleSave, priority = false, aspectRatio = business.aspectRatio }: { business: Business; saved: boolean; onToggleSave: (id: string, business?: Business) => void; priority?: boolean; aspectRatio?: number }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
  const photos = business.photos.filter((photo) => !failedPhotos.includes(photo.id));
  const activePhotoIndex = Math.min(photoIndex, Math.max(0, photos.length - 1));
  const photo = photos[activePhotoIndex];
  const changePhoto = (direction: number) => setPhotoIndex((activePhotoIndex + direction + photos.length) % photos.length);

  return (
    <article className="business-card group" aria-label={business.name} data-business-id={business.id} data-mm-rank={business.mmRank}>
      <div className="card-visual" style={{ aspectRatio }}>
        <Link className="business-profile-link" href={profileHref(business.id, "for-you")} aria-label={`View ${business.name}`}>
        {photo ? <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, (max-width: 1199px) 25vw, (max-width: 1499px) 20vw, (max-width: 1749px) 17vw, 14vw" priority={priority} onError={() => setFailedPhotos((previous) => [...previous, photo.id])} className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" /> : <div className="saved-business-placeholder"><BusinessIcon categories={business.categories} /><span>No business photo available</span></div>}
        <div className="card-shade" />
        </Link>
        <button className={`save-button ${saved ? "is-saved" : ""}`} onClick={() => onToggleSave(business.id, business)} aria-label={`${saved ? "Unsave" : "Save"} ${business.name}`} aria-pressed={saved}>
          {saved ? <Check size={15} /> : <Bookmark size={15} />}<span>{saved ? "Saved" : "Save"}</span>
        </button>
        {photos.length > 1 && <div className="photo-arrows">
          <button aria-label={`Previous photo of ${business.name}`} onClick={() => changePhoto(-1)}><ChevronLeft size={18} /></button>
          <button aria-label={`Next photo of ${business.name}`} onClick={() => changePhoto(1)}><ChevronRight size={18} /></button>
        </div>}
        <div className="business-label">
          <BusinessIcon categories={[business.cuisine, ...business.categoryIds]} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[11px] font-semibold leading-[1.35]">{business.name}</h2>
            <p className="cuisine-label"><MapPin size={9} fill="currentColor" aria-hidden="true" /><span className="truncate">{business.cuisine}</span></p>
          </div>
          <div className="rating" aria-label={`${business.rating} out of 5 stars`}>
            <div className="stars" aria-hidden="true">{[1, 2, 3, 4, 5].map((star) => <span key={star} className="feed-star"><Star size={11} strokeWidth={0} fill="currentColor" /><span style={{ width: `${Math.max(0, Math.min(1, business.rating - star + 1)) * 100}%` }}><Star size={11} strokeWidth={0} fill="currentColor" /></span></span>)}</div>
            <span className="rating-number">{business.rating}</span>
          </div>
        </div>
      </div>
      {photos.length > 1 && <div className="photo-dots" aria-label={`Photos of ${business.name}`}>
        {photos.map((item, index) => <button key={item.id} aria-label={`Show photo ${index + 1} of ${business.name}`} aria-pressed={activePhotoIndex === index} onClick={() => setPhotoIndex(index)}><span className={activePhotoIndex === index ? "active" : ""} /></button>)}
      </div>}
      <div className="card-footer">
        {business.caption && <p className="truncate"><Link href={profileHref(business.id, "for-you")}>{business.caption}</Link></p>}
        <details className="card-menu">
          <summary aria-label={`More options for ${business.name}`}><MoreHorizontal size={17} /></summary>
          <div className="card-menu-content"><button onClick={(event) => { onToggleSave(business.id, business); event.currentTarget.closest("details")?.removeAttribute("open"); }}><Bookmark size={15} />{saved ? "Remove from saved" : "Save this place"}</button><p>{business.address ?? business.location}</p>{business.reviewCount !== undefined && <p>{business.reviewCount} Yelp reviews</p>}</div>
        </details>
      </div>
    </article>
  );
}
