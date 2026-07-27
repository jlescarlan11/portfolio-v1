export const TYPOGRAPHY_STYLES = {
  eyebrow: 'caption uppercase tracking-[0.16em] text-subtle-foreground',
  linkPrimary:
    'label underline underline-offset-4 decoration-foreground transition-colors duration-200 hover:text-muted-foreground hover:decoration-muted-foreground',
  linkSecondary:
    'label text-muted-foreground underline underline-offset-4 decoration-muted-foreground transition-colors duration-200 hover:text-foreground hover:decoration-foreground'
} as const;

export const SURFACE = {
  hairline: 'border-surface'
} as const;
