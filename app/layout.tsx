import ClientOnly from "@/components/ClientOnly";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/models/ConfirmModal";
import LoginModal from "@/components/models/LoginModal";
import RegisterModal from "@/components/models/RegisterModal";
import RentModal from "@/components/models/RentModal";
import SearchModal from "@/components/models/SearchModal";
import Navbar from "@/components/navbar/Navbar";
import Providers from "@/components/providers/Providers";
import { Nunito } from "next/font/google";
import "../styles/globals.css";
import getCurrentUser from "./actions/getCurrentUser";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";

export const metadata = {
  title: "Resound - Classical Instrument Rentals",
  description: "Rent premium musical instruments from trusted lenders in your area",
  icons: "/assets/harp-icon.svg",
};

const font = Nunito({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial", "sans-serif"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className={font.className}>
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <Providers currentUser={currentUser}>
          <div className="min-h-screen flex flex-col">
            <ClientOnly>
              <Toast />
              <SearchModal />
              <RegisterModal />
              <LoginModal />
              <RentModal />
              <ConfirmModal />
              <Navbar currentUser={currentUser} />
            </ClientOnly>
            <div className="flex-1 pt-28">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
