import { createTheme, MantineColorsTuple } from '@mantine/core';
import { sageDark, teal as radixTeal } from '@radix-ui/colors';

const darkValues = Object.values(sageDark).reverse();
const tealValues = Object.values(radixTeal);

// Mantine v7 expects exactly 10 color shades
const dark: MantineColorsTuple = [
  darkValues[2] || '#000',
  darkValues[3] || '#111',
  darkValues[4] || '#222',
  darkValues[5] || '#333',
  darkValues[6] || '#444',
  darkValues[7] || '#555',
  darkValues[8] || '#666',
  darkValues[9] || '#777',
  darkValues[10] || '#888',
  darkValues[11] || '#999',
];

const teal: MantineColorsTuple = [
  tealValues[2] || '#0f0',
  tealValues[3] || '#0e0',
  tealValues[4] || '#0d0',
  tealValues[5] || '#0c0',
  tealValues[6] || '#0b0',
  tealValues[7] || '#0a0',
  tealValues[8] || '#090',
  tealValues[9] || '#080',
  tealValues[10] || '#070',
  tealValues[11] || '#060',
];

// Custom fib function for theme.other
export const fib = (
  values: Array<number | string> | number,
  suffix = '',
  factor = 1
): string => {
  const params: Array<number | string> =
    typeof values === 'number' ? [values] : values;
  const res: Array<number | string> = [];
  for (const val of params) {
    if (typeof val === 'number')
      res.push(`${Math.round(0.618 ** -val * factor * 1000) / 1000}${suffix}`);
    else res.push(val);
  }
  return res.join(' ');
};

export const theme = createTheme({
  colors: {
    dark,
    teal,
  },
  primaryColor: 'teal',
  headings: { fontFamily: '"Kufam", sans-serif', fontWeight: '100' },
  other: {
    fib,
  },
});

declare module '@mantine/core' {
  export interface MantineThemeOther {
    fib: (
      values: Array<number | string> | number,
      suffix?: string,
      factor?: number
    ) => string;
  }
}
