// ============================================================================
// Серверна сторінка 404 (Сторінку не знайдено) з підтримкою SEO та затримкою
// редіректу без використання клієнтських hooks.
// ============================================================================

import type { Metadata } from "next";

// Експорт метаданих згідно з вимогами домашнього завдання
export const metadata: Metadata = {
  title: "404 - Page not found | NoteHub",
  description: "Sorry, the page you are looking for does not exist or has been moved.",
  openGraph: {
    title: "404 - Page not found | NoteHub",
    description: "Sorry, the page you are looking for does not exist or has been moved.",
    url: "https://notehub.com",
    images: [
      {
        url: "https://goit.global",
        width: 1200,
        height: 630,
        alt: "404 Page Not Found | NoteHub",
      },
    ],
  },
};

export default function NotFound() {
  return (
    <>
      {/* 
        Автоматичний редірект засобами браузера.
        content="10;url=/" означає: зачекати 5 секунди та перейти на "/"
      */}
      <meta httpEquiv="refresh" content="5;url=/" />

      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>404 | Page not found</h1>
        <p style={{ fontSize: "18px", color: "#555" }}>
          Sorry, the page you are looking for does not exist.
        </p>
        <p style={{ color: "gray", fontSize: "14px", marginTop: "20px" }}>
          You will be automatically redirected to the home page in 5 seconds...
        </p>
      </div>
    </>
  );
}
