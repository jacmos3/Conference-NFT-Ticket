// pages/_app.js
import '../styles/global.scss'
import "../styles/app.css";
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
