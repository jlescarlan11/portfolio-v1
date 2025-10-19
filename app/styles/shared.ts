// Shared styles and utilities to eliminate repetition (DRY principle)

export const BUTTON_STYLES = {
  primary: `
    inline-block
    px-8 py-3
    text-sm uppercase tracking-wider
    border border-white
    text-white
    transition-all duration-300
    hover:bg-white hover:text-black
  `,
  carousel: `
    absolute top-1/2 -translate-y-1/2 z-10
    w-10 h-10 md:w-12 md:h-12
    flex items-center justify-center
    bg-black/80 backdrop-blur-sm
    border border-gray-700
    text-white
    transition-all duration-300
    hover:bg-white hover:text-black hover:border-white
    disabled:opacity-30 disabled:cursor-not-allowed
  `
} as const;

// Animation constants for consistent timing across the app
export const ANIMATION_CONFIG = {
  durations: {
    fast: 0.2,
    medium: 0.5,
    slow: 0.8,
    verySlow: 1.0,
  },
  delays: {
    none: 0,
    short: 0.15,
    medium: 0.3,
    long: 0.6,
  },
  easing: {
    smooth: [0.25, 0.46, 0.45, 0.94],
  },
} as const;

export const ANIMATION_STYLES = {
  fadeIn: 'animate-in',
  fadeInOpacity: { opacity: 0 },
} as const;

// Shared spacing values
export const SPACING = {
  section: {
    padding: 'px-6 md:px-12 py-16 md:py-24',
  },
  container: {
    gap: 'gap-6 lg:gap-8',
  },
} as const;

export const LAYOUT_STYLES = {
  section: `
    min-h-screen
    px-6 md:px-12
    py-16 md:py-24
    bg-black
  `,
  container: 'max-w-4xl mx-auto',
  grid: 'grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12',
  responsiveGrid: 'grid grid-cols-1 md:grid-cols-2 gap-8'
} as const;

export const TYPOGRAPHY_STYLES = {
  sectionTitle: `
    text-sm md:text-base
    uppercase
    tracking-[0.3em]
    leading-none
    mb-2
    text-white
    font-light
  `,
  projectTitle: `
    text-4xl md:text-6xl lg:text-7xl
    font-light
    tracking-tighter
    leading-none
    mb-6
    text-white
  `,
  infoLabel: 'text-sm uppercase tracking-wider text-gray-500 mb-3',
  infoValue: 'text-base text-white'
} as const;

// Simple responsive breakpoint utility
export const getResponsiveItems = (screenWidth: number) => {
  if (screenWidth >= 1024) return 3;
  if (screenWidth >= 768) return 2;
  return 1;
};
