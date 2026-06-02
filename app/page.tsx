"use client";

import dynamic from "next/dynamic";

const Flipbook = dynamic(() => import("@/components/Flipbook"), {
  ssr: false,
  loading: () => (
    <div className="app">
      <div className="loader">
        <div className="spinner" />
      </div>
    </div>
  ),
});

export default function Home() {
  return <Flipbook />;
}
