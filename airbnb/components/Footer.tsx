"use client";

import { motion } from "framer-motion";
import React from "react";
import ClientOnly from "./ClientOnly";
import FooterColumn from "@/components/FooterColumn";

type Props = {};

function Footer({}: Props) {
  const itemData = [
    ["ABOUT", "How InstruRent works", "Newsroom", "Investors", "Careers", "Trust & Safety"],
    ["SUPPORT", "Help Center", "InstruProtect", "Cancellation options", "Safety information", "Report a listing"],
    ["LENDING", "Start lending instruments", "InstruProtect for Lenders", "Lending resources", "Community forum", "Responsible lending"],
    ["COMMUNITY", "Musician stories", "Meet local musicians", "Instrument care tips", "Music events", "Refer a friend"],
  ];

  const footerColumns = itemData.map((item, index) => (
    <FooterColumn key={index} index={index} data={item} />
  ))

  return (
    <ClientOnly>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 px-32 py-14 bg-gray-100 text-gray-600">
        {footerColumns}
      </div>
    </ClientOnly>
  );
}

export default Footer;
