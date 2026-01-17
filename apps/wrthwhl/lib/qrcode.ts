import QRCode from 'qrcode';

/**
 * Generates a QR code SVG string for the given URL.
 * Used at build time to embed QR code in the page.
 */
export async function generateQRCode(url: string): Promise<string> {
  const svg = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    width: 64,
    color: {
      dark: '#5eead4', // teal-5
      light: '#00000000', // transparent
    },
  });
  return svg;
}
