import Image from "next/image";

export function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><Image src="/brand/parrot.svg" alt="" width={40} height={40} priority /></span>;
}
