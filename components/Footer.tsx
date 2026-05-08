"use client";

import React from "react";
import Link from "next/link";
import ClientOnly from "./ClientOnly";
import FooterColumn from "@/components/FooterColumn";
import Container from "./Container";

type Props = {};

function Footer({}: Props) {
  const itemData = [
    ["Company", "About", "How it works", "Contact us"],
    ["Custodial", "Help Center", "Safety", "Report an issue"],
    ["Lending", "List your instrument", "Host resources", "Host responsibilities"],
    ["Records", "Terms of Service", "Privacy Policy", "Cancellation policy"],
  ];

  const footerColumns = itemData.map((item, index) => (
    <FooterColumn key={index} index={index} data={item} />
  ));

  return (
    <ClientOnly>
      <footer className="mt-auto border-t border-ink/40 bg-ink text-paper">
        <Container>
          <div className="grid grid-cols-2 gap-12 px-2 py-16 md:grid-cols-12 md:gap-10 md:px-0 md:py-20">
            {/* Colophon */}
            <div className="col-span-2 md:col-span-4">
              <p className="font-mono text-[10px] uppercase tracking-archive text-paper/60">
                Colophon
              </p>
              <h3 className="mt-4 font-display text-[44px] leading-[0.95] tracking-[-0.02em] text-paper md:text-[56px]">
                R<span className="editorial-italic text-brass">é</span>sound
              </h3>
              <p className="mt-5 max-w-sm font-display text-[14px] leading-relaxed text-paper/70">
                The archive is set in{" "}
                <span className="editorial-italic">Fraunces</span> &amp;{" "}
                <span className="editorial-italic">Instrument Serif</span>,
                bound digitally, distributed in season.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                <span className="font-mono text-[10px] uppercase tracking-archive text-paper/70">
                  Established MMXXVI · Issue 026
                </span>
              </div>
            </div>

            {/* Index columns */}
            <div className="col-span-2 grid grid-cols-2 gap-10 md:col-span-7 md:col-start-6 md:grid-cols-4">
              {footerColumns}
            </div>
          </div>

          <div className="border-t border-paper/20">
            <div className="flex flex-col items-start justify-between gap-3 px-2 py-6 md:flex-row md:items-center md:px-0">
              <p className="font-mono text-[10px] uppercase tracking-archive text-paper/60">
                © {new Date().getFullYear()} Resound — All performances reserved.
              </p>
              <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-archive text-paper/60">
                <Link href="/terms" className="transition hover:text-paper">
                  Terms
                </Link>
                <span className="h-3 w-px bg-paper/20" />
                <Link href="/privacy" className="transition hover:text-paper">
                  Privacy
                </Link>
                <span className="h-3 w-px bg-paper/20" />
                <Link
                  href="/contact"
                  className="transition hover:text-paper"
                >
                  Reach the editors
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </ClientOnly>
  );
}

export default Footer;
