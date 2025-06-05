"use client";

import { motion } from "framer-motion";
import React from "react";
import ClientOnly from "./ClientOnly";
import FooterColumn from "@/components/FooterColumn";

type Props = {};

function Footer({}: Props) {
  const itemData = [
    ["ABOUT", "How Resound works", "Newsroom", "Investors", "Careers", "Trust & Safety"],
    ["SUPPORT", "Help Center", "ResoundProtect", "Cancellation options", "Safety information", "Report an instrument"],
    ["LENDING", "List your instrument", "ResoundProtect for Lenders", "Lending resources", "Community forum", "Responsible lending"],
    ["DISCOVER", "Featured instruments", "Violin rentals", "Piano rentals", "Cello rentals", "Wind instruments"],
  ];

  const footerColumns = itemData.map((item, index) => (
    <FooterColumn key={index} index={index} data={item} />
  ))

  return (
    <ClientOnly>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 px-32 py-14 bg-amber-50 text-amber-900">
        {footerColumns}
      </div>
    </ClientOnly>
  );
}

export default Footer;
