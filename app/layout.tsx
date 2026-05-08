import ClientOnly from "@/components/ClientOnly";
import DemoBanner from "@/components/DemoBanner";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/models/ConfirmModal";
import LoginModal from "@/components/models/LoginModal";
import RegisterModal from "@/components/models/RegisterModal";
import RentModal from "@/components/models/RentModal";
import SearchModal from "@/components/models/SearchModal";
import Navbar from "@/components/navbar/Navbar";
import Providers from "@/components/providers/Providers";
import {
  Fraunces,
  Inter,
  Instrument_Serif,
  JetBrains_Mono,
} from "next/font/google";
import "../styles/globals.css";
import getCurrentUser from "./actions/getCurrentUser";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";

export const metadata = {
  title: "Resound — A Catalogue of Performance-Ready Instruments",
  description:
    "An archive marketplace for classical musicians to lend and borrow rare, performance-ready instruments.",
  icons: "/assets/harp-icon.svg",
};

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSerif.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans">
        <NextSSRPlugin
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
            <div className="flex-1 pt-[140px] md:pt-[152px]">
              <DemoBanner />
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
