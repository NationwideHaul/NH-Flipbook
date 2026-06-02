"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";
import HTMLFlipBook from "react-pageflip";
import {
  PAGES,
  TOTAL_PAGES,
  CHAPTERS,
  pagePath,
  thumbPath,
} from "@/app/catalog-data";

/* ---------- icons ---------- */
const Icon = {
  prev: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
  ),
  next: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
  ),
  first: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 17l-5-5 5-5" /><path d="M11 17l-5-5 5-5" /></svg>
  ),
  last: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 17l5-5-5-5" /><path d="M13 17l5-5-5-5" /></svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
  ),
  expand: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  ),
};

/* ---------- a single page (must be a real element for react-pageflip) ---------- */
const Page = forwardRef<
  HTMLDivElement,
  { n: number; side: "left" | "right"; priority: boolean; hard: boolean }
>(({ n, side, priority, hard }, ref) => (
  <div className={`page page--${side}`} ref={ref} data-density={hard ? "hard" : "soft"}>
    <img
      src={pagePath(n)}
      alt={`${PAGES[n - 1]?.title ?? "Page"} — page ${n}`}
      loading={priority ? "eager" : "lazy"}
      draggable={false}
    />
    <span className="page-gutter" aria-hidden />
  </div>
));
Page.displayName = "Page";

type FlipApi = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    flip: (page: number) => void;
    turnToPage: (page: number) => void;
    getCurrentPageIndex: () => number;
  };
};

export default function Flipbook() {
  const bookRef = useRef<FlipApi | null>(null);
  const [size, setSize] = useState<{ w: number; h: number; portrait: boolean } | null>(null);
  const [current, setCurrent] = useState(0); // 0-indexed left page of spread
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const lastFlip = useRef(0);
  const drawerOpenRef = useRef(false);
  drawerOpenRef.current = drawerOpen;

  /* compute page pixel size from viewport */
  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const small = vw <= 640;
      const reservedTop = small ? 54 : 64;
      const reservedBottom = small ? 78 : 92;
      const availH = vh - reservedTop - reservedBottom - 10;
      // Single page on phones and on short landscape screens.
      const portrait = vw <= 800 || vh <= 480;

      let s: number;
      if (portrait) {
        s = Math.min(availH, vw * (small ? 0.97 : 0.92), 760);
      } else {
        // two-page spread; leave room at the edges for the nav chevrons
        s = Math.min(availH, (vw - 150) / 2, 880);
      }
      s = Math.max(220, Math.floor(s));
      setSize((prev) => {
        if (prev && prev.w === s && prev.portrait === portrait) return prev;
        return { w: s, h: s, portrait };
      });
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

  const goNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);
  const goPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const goTo = useCallback((page1: number) => {
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    const target = Math.min(TOTAL_PAGES - 1, Math.max(0, page1 - 1));
    // Jump instantly for chapter/thumbnail navigation: animated flip()
    // overshoots on multi-page hops in portrait mode. turnToPage() fires
    // onFlip with the exact target, which syncs the counter and URL hash.
    api.turnToPage(target);
    setDrawerOpen(false);
  }, []);
  const goFirst = useCallback(() => bookRef.current?.pageFlip()?.turnToPage(0), []);
  const goLast = useCallback(
    () => bookRef.current?.pageFlip()?.turnToPage(TOTAL_PAGES - 1),
    []
  );

  /* keyboard nav */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") goNext();
      else if (e.key === "ArrowLeft" || e.key === "PageUp") goPrev();
      else if (e.key === "Home") goFirst();
      else if (e.key === "End") goLast();
      else if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, goFirst, goLast]);

  /* scroll wheel turns pages (throttled to one flip per gesture window) */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (drawerOpenRef.current) return;
      if (Math.abs(e.deltaY) < 16) return;
      e.preventDefault();
      const now = e.timeStamp || performance.now();
      if (now - lastFlip.current < 700) return;
      lastFlip.current = now;
      if (e.deltaY > 0) goNext();
      else goPrev();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [goNext, goPrev]);

  /* reveal the book once it has mounted with a computed size
     (react-pageflip's onInit is unreliable across versions) */
  useEffect(() => {
    if (!size) return;
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, [size]);

  /* open to a page from URL hash (#page=N) once ready */
  useEffect(() => {
    if (!ready) return;
    const m = window.location.hash.match(/page=(\d+)/);
    if (m) {
      const p = Math.min(TOTAL_PAGES, Math.max(1, parseInt(m[1], 10)));
      if (p > 1) setTimeout(() => goTo(p), 180);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /* hide the swipe hint after a moment */
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrent(e.data);
    setShowHint(false);
    const page1 = e.data + 1;
    history.replaceState(null, "", page1 > 1 ? `#page=${page1}` : " ");
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  const activeChapter = useMemo(() => {
    const page1 = current + 1;
    let best = CHAPTERS[0];
    for (const c of CHAPTERS) if (c.page <= page1) best = c;
    return best.label;
  }, [current]);

  // Human-friendly counter: covers shown as single, interior as a spread range.
  // `current` is the 0-indexed left page of the spread, so the visible pages
  // are (current+1) and (current+2) in 1-indexed terms.
  const counterLabel = useMemo(() => {
    if (size?.portrait) return `${current + 1}`;
    if (current === 0) return "1";
    if (current >= TOTAL_PAGES - 1) return `${TOTAL_PAGES}`;
    const left = current + 1;
    const right = Math.min(current + 2, TOTAL_PAGES);
    return `${left}–${right}`;
  }, [current, size]);

  // Stable children: a new array reference would re-render the memoized
  // HTMLFlipBook on every parent state change, re-attaching handlers and
  // resetting its position. Build the page elements exactly once.
  const bookPages = useMemo(
    () =>
      PAGES.map((p, i) => (
        <Page
          key={p.n}
          n={p.n}
          side={i % 2 === 0 ? "right" : "left"}
          priority={i < 4}
          hard={p.n === 1 || p.n === TOTAL_PAGES}
        />
      )),
    []
  );

  return (
    <div className="app">
      {/* Floating brand logo */}
      <img className="logo" src="/logo.png" alt="Nationwide Haul" />

      {/* Top-right actions */}
      <div className="top-actions">
        <button className="gbtn" onClick={() => setDrawerOpen(true)} aria-label="All pages" title="All pages">
          {Icon.grid}
        </button>
        <a className="gbtn" href="/NationwideHaul-Catalog.pdf" download aria-label="Download PDF" title="Download PDF">
          {Icon.download}
        </a>
        <button className="gbtn" onClick={toggleFullscreen} aria-label="Fullscreen" title="Fullscreen">
          {Icon.expand}
        </button>
      </div>

      {/* Stage */}
      <div className="stage">
        {!ready && (
          <div className="loader">
            <div className="spinner" />
          </div>
        )}

        {size && (
          <>
            <button
              className="edge-arrow left"
              onClick={goPrev}
              disabled={current === 0}
              aria-label="Previous page"
            >
              {Icon.prev}
            </button>

            <div className="book-wrap" style={{ opacity: ready ? 1 : 0 }}>
              {/* @ts-expect-error react-pageflip types lag behind React 19 */}
              <HTMLFlipBook
                ref={bookRef}
                width={size.w}
                height={size.h}
                size="fixed"
                minWidth={260}
                maxWidth={1000}
                minHeight={260}
                maxHeight={1000}
                showCover
                usePortrait={size.portrait}
                mobileScrollSupport
                renderOnlyPageLengthChange
                maxShadowOpacity={0.6}
                flippingTime={700}
                drawShadow
                startPage={0}
                onFlip={onFlip}
                className="nh-book"
              >
                {bookPages}
              </HTMLFlipBook>
            </div>

            <button
              className="edge-arrow right"
              onClick={goNext}
              disabled={current >= TOTAL_PAGES - 1}
              aria-label="Next page"
            >
              {Icon.next}
            </button>

            {showHint && ready && (
              <div className="hint">
                {size.portrait
                  ? "Swipe or use the arrows below to turn pages"
                  : "Scroll, use ← → , or click the arrows to turn pages"}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom control pill */}
      <div className="controls">
        <button className="cbtn" onClick={goFirst} disabled={current === 0} aria-label="First page" title="First page">
          {Icon.first}
        </button>
        <button className="cbtn" onClick={goPrev} disabled={current === 0} aria-label="Previous page">
          {Icon.prev}
        </button>
        <span className="counter">
          {counterLabel} <small>/ {TOTAL_PAGES}</small>
        </span>
        <button className="cbtn" onClick={goNext} disabled={current >= TOTAL_PAGES - 1} aria-label="Next page">
          {Icon.next}
        </button>
        <button className="cbtn" onClick={goLast} disabled={current >= TOTAL_PAGES - 1} aria-label="Last page" title="Last page">
          {Icon.last}
        </button>
      </div>

      {/* Thumbnail / section drawer */}
      <div
        className={`drawer-backdrop ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside className={`drawer ${drawerOpen ? "open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="drawer-head">
          <h3>Browse the Catalog</h3>
          <button className="gbtn" onClick={() => setDrawerOpen(false)} aria-label="Close">
            {Icon.close}
          </button>
        </div>

        <div className="sections">
          {CHAPTERS.map((c) => (
            <button
              key={c.label}
              className={`chip ${activeChapter === c.label ? "active" : ""}`}
              onClick={() => goTo(c.page)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="thumb-grid">
          {PAGES.map((p) => {
            const isActive = p.n === current + 1 || p.n === current + 2;
            return (
              <button
                key={p.n}
                className={`thumb ${isActive ? "active" : ""}`}
                onClick={() => goTo(p.n)}
                title={p.title}
              >
                <img src={thumbPath(p.n)} alt={p.title} loading="lazy" />
                <span className="badge">{p.n}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
