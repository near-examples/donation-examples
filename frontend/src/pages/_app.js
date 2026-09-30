import { Navigation } from "@/components/Navigation";
import { NearProvider } from "@/components/near-provider";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <NearProvider>
      <Navigation />
      <Component {...pageProps} />
    </NearProvider>
  );
}
