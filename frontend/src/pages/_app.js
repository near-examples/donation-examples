import { Navigation } from "@/components/Navigation";
import { NetworkId } from "@/config";
import "@/styles/globals.css";

import { NearProvider } from "near-connect-hooks";

export default function App({ Component, pageProps }) {
  return (
    <NearProvider config={{ network: NetworkId }}>
      <Navigation />
      <Component {...pageProps} />
    </NearProvider>
  );
}
