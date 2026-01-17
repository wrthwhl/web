import { Head, Html, Main, NextScript } from 'next/document';

// Blocking script to prevent theme flicker
// Runs before page renders to set the correct theme class
const themeScript = `
  (function() {
    var theme = localStorage.getItem('theme');
    if (theme === 'light' || (!theme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
      document.documentElement.classList.add('light');
    }
  })();
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Kufam:ital,wght@0,400;0,800;1,400;1,800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <style>{`body, #__next { height: 100vh; }`}</style>
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
