// Shared styles and utilities to eliminate repetition (DRY principle)

export const BUTTON_STYLES = {
  primary: `
    inline-block
    px-6 py-2.5
    text-[11px] uppercase tracking-[0.3em]
    border border-white/80
    text-white
    transition-[background-color,transform,color] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
    hover:bg-white/10
    active:bg-white/20
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50
  `,
  link: `
    inline-flex items-center gap-2
    text-[11px] uppercase tracking-[0.3em]
    text-white/80 hover:text-white
    underline underline-offset-4 decoration-transparent hover:decoration-white
    transition-colors duration-300
  `,
  carousel: `
    absolute top-1/2 -translate-y-1/2 z-10
    w-10 h-10 md:w-11 md:h-11
    flex items-center justify-center
    bg-transparent
    text-white
    transition-all duration-300
    disabled:opacity-30 disabled:cursor-not-allowed
    rounded-full
    hover:bg-white/10 active:bg-white/20
    focus:outline-none focus:ring-2 focus:ring-white/50
  `
} as const;

// Animation constants for consistent timing across the app
export const ANIMATION_CONFIG = {
  durations: {
    fast: 0.25,
    medium: 0.6,
    slow: 0.9,
    verySlow: 1.2,
  },
  delays: {
    none: 0,
    short: 0.15,
    medium: 0.35,
    long: 0.7,
  },
  easing: {
    smooth: [0.25, 0.46, 0.45, 0.94],
    quiet: [0.2, 0, 0, 1],
  },
} as const;

export const ANIMATION_STYLES = {
  fadeIn: 'animate-in',
  fadeInOpacity: { opacity: 0 },
} as const;

// Shared Motion variants to ensure consistent motion language
export const MOTION_VARIANTS = {
  fadeUp: {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  fade: {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
} as const;

// Shared spacing values
export const SPACING = {
  section: {
    padding: 'px-6 md:px-12 py-16 md:py-24',
  },
  container: {
    gap: 'gap-6 lg:gap-8',
  },
  asymmetry: {
    // manifesto spacing unused; keep body only for now to avoid drift
    body: 'pt-6 md:pt-10'
  }
} as const;

export const LAYOUT_STYLES = {
  section: `
    px-6 md:px-12
    py-16 md:py-24
    bg-black
  `,
  container: 'max-w-5xl mx-auto',
  grid: 'grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12',
  responsiveGrid: 'grid grid-cols-1 md:grid-cols-2 gap-8'
} as const;

export const TYPOGRAPHY_STYLES = {
  sectionTitle: `
    text-xs md:text-sm
    uppercase
    tracking-[0.3em]
    leading-none
    mb-2
    text-white/80
    font-light
  `,
  manifesto: `
    text-3xl md:text-5xl lg:text-6xl
    font-light
    tracking-tight
    leading-[1.05]
    text-white
    max-w-[38ch]
  `,
  projectTitle: `
    text-4xl md:text-5xl lg:text-7xl
    font-light
    tracking-tight
    leading-[0.95]
    mb-6
    text-white
  `,
  infoLabel: 'text-sm uppercase tracking-wider text-gray-500 mb-3',
  infoValue: 'text-base text-white'
} as const;

// Yohji-inspired hairlines and opacities
export const SURFACE = {
  hairline: 'border-white/12',
  hairlineStrong: 'border-white/20',
  divider: 'bg-white/10',
  subtle: 'text-white/85',
  muted: 'text-white/60',
  quiet: 'text-white/45',
} as const;

export const MOTION = {
  enter: 'transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
  hover: 'transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
} as const;

// Simple responsive breakpoint utility
export const getResponsiveItems = (screenWidth: number) => {
  if (screenWidth >= 1024) return 3;
  if (screenWidth >= 768) return 2;
  return 1;
};
