import "../styles/global.css"; // Import global CSS file
import "../styles/auth.css";   // Import auth CSS globally
import "rc-slider/assets/index.css"; // Import slider styles

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
