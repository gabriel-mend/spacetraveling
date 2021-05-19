import { AppProps } from 'next/app';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return <>
    <title>Space Traveling</title>
    <Component {...pageProps} />
  </>;
}

export default MyApp;
