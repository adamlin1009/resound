import ClientOnly from "@/components/ClientOnly";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/models/ConfirmModal";
import LoginModal from "@/components/models/LoginModal";
import RegisterModal from "@/components/models/RegisterModal";
import RentModal from "@/components/models/RentModal";
import SearchModal from "@/components/models/SearchModal";
import Navbar from "@/components/navbar/Navbar";
import { Nunito } from "next/font/google";
import "../styles/globals.css";
import getCurrentUser from "./actions/getCurrentUser";

export const metadata = {
  title: "Resound - Classical Instrument Rentals",
  description: "Rent premium musical instruments from trusted lenders in your area",
  icons: "/assets/harp-icon.svg",
};

const font = Nunito({
  subsets: ["latin"],
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
        <ClientOnly>
          <Toast />
          <SearchModal />
          <RegisterModal />
          <LoginModal />
          <RentModal />
          <ConfirmModal />
          <Navbar currentUser={currentUser} />
        </ClientOnly>
        <div className="pb-20 pt-28">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
