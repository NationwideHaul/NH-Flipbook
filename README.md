# NH Flipbook — Nationwide Haul Digital Catalog

Standalone digital flipbook microsite for the Nationwide Haul company catalog
(24 pages, square format). Built with Next.js + TypeScript and
[`react-pageflip`](https://github.com/Nodlik/react-pageflip).

**Live:** https://nh-catalog.vercel.app · **Domain:** catalog.nationwidehaul.com

## Features

- Realistic page-turn animation with a printed-book spine shadow
- Two-page spread on desktop, single page on mobile (responsive)
- Navigate by edge arrows, on-screen controls (first / prev / next / last),
  **mouse-wheel scroll**, keyboard (← → Home End), and deep links (`#page=N`)
- Thumbnail drawer with section quick-jumps
- Download the full PDF, fullscreen mode
- SEO + Open Graph, sitemap, favicon, long-cache static asset headers

## Development

```bash
npm install
npm run dev          # http://localhost:3000
```

## Regenerating page images

Pages are rendered from the source PDF and optimized to WebP.

```bash
# 1. render the PDF to PNGs (requires poppler's pdftoppm)
pdftoppm -png -scale-to 2000 source.pdf ~/nh-catalog-build/render/page

# 2. convert to optimized WebP pages + thumbnails + OG image
npm run assets       # reads from ~/nh-catalog-build/render, writes to public/pages
```

## Deploy

```bash
npm run build
vercel deploy --prod --yes      # Vercel project: nationwide-haul/nh-catalog
```

## Tech notes

- Only the front/back cover pages use `data-density="hard"`; interior pages are `soft`.
- `HTMLFlipBook` is given a memoized children array + `renderOnlyPageLengthChange`
  so parent re-renders don't re-attach handlers or reset the page position.
- Section/thumbnail jumps use `turnToPage()` (instant, exact) rather than the
  animated `flip()`, which overshoots on multi-page hops in portrait mode.
