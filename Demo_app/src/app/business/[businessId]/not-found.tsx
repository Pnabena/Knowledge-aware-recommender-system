import Link from "next/link";
import { Store } from "lucide-react";

export default function BusinessNotFound() {
  return <main className="empty-state"><Store size={40} strokeWidth={1.4} /><h1 className="text-2xl font-semibold">We couldn’t find this place</h1><p>It may not be part of the demo collection yet.</p><Link href="/" className="profile-primary-button">Return to For You</Link></main>;
}
