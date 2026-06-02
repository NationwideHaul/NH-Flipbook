import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://catalog.nationwidehaul.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Nationwide Haul — Digital Catalog",
  description:
    "Built for the road ahead. Explore the complete Nationwide Haul ecosystem — dealership, equipment finance, insurance, and service — in our interactive digital catalog.",
  keywords: [
    "Nationwide Haul",
    "semi-trailers",
    "trucking",
    "equipment finance",
    "Road Ready Insurance",
    "NEF",
    "Oakwood Equipment Finance",
    "trailer dealership",
    "Lakeland FL",
  ],
  authors: [{ name: "Nationwide Haul" }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Nationwide Haul",
    title: "Nationwide Haul — Digital Catalog",
    description:
      "A complete ecosystem for America's trucking industry. Flip through our interactive catalog.",
    images: [
      { url: "/og/cover.jpg", width: 1200, height: 630, alt: "Nationwide Haul Catalog" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nationwide Haul — Digital Catalog",
    description: "Built for the road ahead. Explore our interactive digital catalog.",
    images: ["/og/cover.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#15161a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
