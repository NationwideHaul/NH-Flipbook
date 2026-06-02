// Catalog metadata — 24 square pages rendered from NationwideHaul_Catalog-FINAL.pdf
export const TOTAL_PAGES = 24;

export interface CatalogPage {
  /** 1-indexed page number */
  n: number;
  /** Short label shown in the thumbnail drawer */
  title: string;
}

export const PAGES: CatalogPage[] = [
  { n: 1, title: "Cover" },
  { n: 2, title: "Built for the Road Ahead" },
  { n: 3, title: "Contents" },
  { n: 4, title: "How It Started" },
  { n: 5, title: "Nationwide Haul" },
  { n: 6, title: "Service & Repair" },
  { n: 7, title: "NEF — Equipment Finance" },
  { n: 8, title: "Oakwood Equipment Finance" },
  { n: 9, title: "Road Ready Insurance" },
  { n: 10, title: "The Dealership" },
  { n: 11, title: "The Dealership" },
  { n: 12, title: "Built to Scale" },
  { n: 13, title: "Dry Vans & Reefer Trailers" },
  { n: 14, title: "Flatbed & Dump Trailers" },
  { n: 15, title: "Container Chassis & Heavy Haul" },
  { n: 16, title: "Waste & Tank Trailers" },
  { n: 17, title: "Grain & Logging Trailers" },
  { n: 18, title: "Tag Trailers" },
  { n: 19, title: "The Leadership" },
  { n: 20, title: "Founders & Partners" },
  { n: 21, title: "Executive Team" },
  { n: 22, title: "Our Partners" },
  { n: 23, title: "Let's Talk" },
  { n: 24, title: "Back Cover" },
];

// Quick-jump chapters surfaced as chips in the toolbar.
export interface Chapter {
  label: string;
  page: number; // 1-indexed target page
}

export const CHAPTERS: Chapter[] = [
  { label: "Cover", page: 1 },
  { label: "Contents", page: 3 },
  { label: "Our Network", page: 4 },
  { label: "Divisions", page: 5 },
  { label: "The Dealership", page: 11 },
  { label: "Trailers", page: 13 },
  { label: "Leadership", page: 19 },
  { label: "Contact", page: 23 },
];

export const pagePath = (n: number) =>
  `/pages/page-${String(n).padStart(2, "0")}.webp`;
export const thumbPath = (n: number) =>
  `/pages/thumbs/page-${String(n).padStart(2, "0")}.webp`;
