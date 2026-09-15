"use client";

import Image from "next/image";
import { BusinessIcon } from "../business-icon";
import { useState } from "react";

export function BusinessImage({ image, name, categories }: { image: string | null; name: string; categories?: readonly string[] }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (!image || failedSource === image) {
    return <span className="ranking-business-image ranking-image-placeholder" role="img" aria-label={`No business image available for ${name}`} title="No business image available"><BusinessIcon categories={categories} /></span>;
  }
  return <span className="ranking-business-image"><Image src={image} alt={name} fill sizes="72px" className="object-cover" onError={() => setFailedSource(image)} /></span>;
}
