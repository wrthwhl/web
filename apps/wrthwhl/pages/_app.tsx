import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { MantineEmotionProvider, emotionTransform } from '@mantine/emotion';
import { theme } from '../theme';
import { emotionCache } from '../emotion/cache';

// Import Mantine core styles
import '@mantine/core/styles.css';
import '../styles/globals.css';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Marco Kunz</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineEmotionProvider cache={emotionCache}>
        <MantineProvider
          theme={theme}
          forceColorScheme="dark"
          stylesTransform={emotionTransform}
        >
          <Component {...pageProps} />
        </MantineProvider>
      </MantineEmotionProvider>
    </>
  );
}
