import { DiscoveryShell } from "@/components/discovery-shell";
import { getDiscoveryFeed } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function Home() {
  const feed = await getDiscoveryFeed();
  return <DiscoveryShell feed={feed} />;
}
