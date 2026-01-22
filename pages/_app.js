// pages/_app.js
import '../styles/global.scss'
import "../styles/app.css";
// Self-hosted Semantic UI instead of CDN (security: avoids supply chain attacks)
import 'semantic-ui-css/semantic.min.css';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
