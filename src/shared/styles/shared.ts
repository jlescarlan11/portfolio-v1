// Shared styles and utilities to eliminate repetition (DRY principle)

export const BUTTON_STYLES = {
  primary: `
    inline-flex items-center justify-center
    px-6 py-3
    label
    border border-surface-strong
    text-foreground
    transition-colors duration-300
    hover:bg-surface-tint
    active:bg-surface-tint-strong
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50
  `,
  link: `
    inline-flex items-center gap-2
    label
    text-muted-foreground hover:text-foreground
    underline underline-offset-4 decoration-transparent hover:decoration-foreground
    transition-colors duration-300
  `,
  carousel: `
    absolute top-1/2 -translate-y-1/2 z-10
    w-10 h-10 md:w-11 md:h-11
    flex items-center justify-center
    bg-transparent
    text-foreground
    transition-all duration-300
    disabled:opacity-30 disabled:cursor-not-allowed
    hover:bg-surface-tint active:bg-surface-tint-strong
    focus:outline-none focus:ring-2 focus:ring-foreground/50
  `
} as const;

export const TYPOGRAPHY_STYLES = {
  eyebrow: 'caption uppercase tracking-[0.16em] text-subtle-foreground',
  linkPrimary:
    'label underline underline-offset-4 decoration-foreground transition-colors duration-200 hover:text-muted-foreground hover:decoration-muted-foreground',
  linkSecondary:
    'label text-muted-foreground underline underline-offset-4 decoration-muted-foreground transition-colors duration-200 hover:text-foreground hover:decoration-foreground'
} as const;

export const LAYOUT_STYLES = {
  container: 'max-w-5xl mx-auto',
  grid: 'grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12',
  responsiveGrid: 'grid grid-cols-1 md:grid-cols-2 gap-8'
} as const;

export const SURFACE = {
  hairline: 'border-surface',
  hairlineStrong: 'border-surface-strong',
  divider: 'bg-surface-divider',
  subtle: 'text-muted-foreground',
  muted: 'text-subtle-foreground',
  quiet: 'text-subtle-foreground'
} as const;

export const MOTION = {
  hover: 'transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
} as const;

// Simple responsive breakpoint utility
export const getResponsiveItems = (screenWidth: number): number => {
  if (screenWidth >= 1024) return 3;
  if (screenWidth >= 768) return 2;
  return 1;
};
