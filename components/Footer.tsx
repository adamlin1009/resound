"use client";

import React from "react";
import ClientOnly from "./ClientOnly";
import FooterColumn from "@/components/FooterColumn";

type Props = {};

function Footer({}: Props) {
  const itemData = [
    ["COMPANY", "About", "How it works", "Contact us"],
    ["SUPPORT", "Help Center", "Safety", "Report an issue"],
    ["HOSTING", "List your instrument", "Host resources", "Host responsibilities"],
    ["LEGAL", "Terms of Service", "Privacy Policy", "Cancellation policy"],
  ];

  const footerColumns = itemData.map((item, index) => (
    <FooterColumn key={index} index={index} data={item} />
  ))

  return (
    <ClientOnly>
      <footer className="mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 px-8 md:px-32 py-14 bg-amber-50 text-amber-900">
          {footerColumns}
        </div>
      </footer>
    </ClientOnly>
  );
}

export default Footer;
