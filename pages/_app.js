import { Manrope, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
