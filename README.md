# John Lester Escarlan - Portfolio

Portfolio site built with Next.js 15, React 19, TypeScript, and Tailwind CSS 4.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS 4
- React Icons

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
```

## Architecture

```text
app/                    # Next route entrypoints only
src/
  app/                  # refactored route assets and route-specific modules
  features/
    home/
    about/
    contact/
    projects/
  shared/
    components/
    hooks/
    lib/
    site/
    styles/
```

## Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
