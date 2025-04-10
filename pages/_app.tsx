import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { mainnet, polygon, optimism, arbitrum, base, baseSepolia, sepolia } from "viem/chains";
import { CartProvider } from '../context/CartContext';

export default function App({ Component, pageProps }: AppProps) {
  const config = getDefaultConfig({
    appName: "SpSdkTutorial",
    projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || "",
    chains: [mainnet, polygon, optimism, arbitrum, base, baseSepolia, sepolia],
    ssr: true // If your dApp uses server side rendering (SSR)
  });
  return (
    <CartProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={new QueryClient()}>
          <RainbowKitProvider>
            <Component {...pageProps} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </CartProvider>
  );
}
