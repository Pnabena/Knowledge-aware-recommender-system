import type { Metadata } from "next";
import localFont from "next/font/local";
import { DiscoveryStateProvider } from "@/components/discovery-state";
import "./globals.css";
import "./location.css";
import "@xyflow/react/dist/style.css";
import "./profile.css";
import "./explanation.css";
import "./knowledge-graph.css";

const manrope = localFont({ src: "./fonts/Manrope.ttf", variable: "--font-manrope", display: "swap", weight: "200 800" });

export const metadata: Metadata = {
  title: "For You · Local Table",
  description: "A little inspiration for your next great meal. Discover restaurants, cafés, and hidden gems in New Orleans.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={manrope.variable}><body><DiscoveryStateProvider>{children}</DiscoveryStateProvider></body></html>;
}
