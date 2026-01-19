// Phi-based spacing utilities
export const PHI = 1.618033988749895;
export const PHI_INVERSE = 0.618033988749895;

/**
 * Calculate phi-based spacing value
 * fib(0) = 1rem, fib(1) = 1.618rem, fib(-1) = 0.618rem
 */
export function fib(n: number): number {
  return Math.pow(PHI, n);
}

/**
 * Get phi-based spacing as rem string
 */
export function fibRem(n: number): string {
  return `${fib(n)}rem`;
}

// Spacing scale (phi-based)
export const spacing = {
  'phi-3xs': fibRem(-4), // ~0.146rem
  'phi-2xs': fibRem(-3), // ~0.236rem
  'phi-xs': fibRem(-2), // ~0.382rem
  'phi-sm': fibRem(-1), // ~0.618rem
  'phi-md': fibRem(0), // 1rem
  'phi-lg': fibRem(1), // ~1.618rem
  'phi-xl': fibRem(2), // ~2.618rem
  'phi-2xl': fibRem(3), // ~4.236rem
  'phi-3xl': fibRem(4), // ~6.854rem
} as const;

// Border radius scale (phi-based)
export const borderRadius = {
  'rounded-phi-sm': fibRem(-2),
  'rounded-phi': fibRem(-1),
  'rounded-phi-lg': fibRem(0),
  'rounded-phi-xl': fibRem(1),
} as const;
