// pages/_app.tsx
import "../styles/globals.css";        // <-- Tailwind debe ir primero
import "../styles/LintrixWallet.css";  // <-- luego tus estilos custom

import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";

// Crear el cliente global de React Query
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Thirdweb necesita que QueryClient ya esté activo */}
      <ThirdwebProvider
        clientId="c66653b5ffd0ea44470ec664990cec1e"
        activeChain="binance" // BNB Smart Chain
      >
        <Component {...pageProps} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
        />
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
