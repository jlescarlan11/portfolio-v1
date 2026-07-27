/* eslint-disable @next/next/no-html-link-for-pages -- Native recovery links keep next/link client code out of every route's root not-found boundary. */

const NOT_FOUND_HEADING_ID = 'not-found-heading';

export default function NotFound(): React.JSX.Element {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh place-items-center bg-surface px-6 py-24"
    >
      <section
        aria-labelledby={NOT_FOUND_HEADING_ID}
        className="w-full max-w-xl border border-surface p-8 sm:p-12"
      >
        <p
          className="mb-4 font-semibold uppercase tracking-[0.16em] text-subtle-foreground"
        >
          Error 404
        </p>
        <h1
          id={NOT_FOUND_HEADING_ID}
          className="display"
        >
          This page could not be found.
        </h1>
        <p
          className="body-lg mt-5"
        >
          The project link may have changed, but the portfolio and case studies
          are still available.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/#work"
            className="label inline-flex items-center justify-center border border-surface-strong px-6 py-3 text-foreground transition-colors duration-300 hover:bg-surface-tint active:bg-surface-tint-strong"
          >
            Browse selected work
          </a>
          <a
            href="/"
            className="label inline-flex items-center gap-2 text-muted-foreground underline decoration-transparent underline-offset-4 transition-colors duration-300 hover:text-foreground hover:decoration-foreground"
          >
            Return home
          </a>
        </div>
      </section>
    </main>
  );
}
