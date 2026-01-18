import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { ThemeProvider } from '../lib/ThemeContext';
import { trackPageview } from '../lib/analytics';
import '../styles/globals.css';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  // Track pageview on mount
  useEffect(() => {
    trackPageview();
  }, []);

  return (
    <>
      <Head>
        <title>Marco Kunz</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
