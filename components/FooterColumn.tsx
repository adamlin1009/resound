"use client";

import Link from "next/link";

type Props = {
  index: number;
  data: Array<string>;
};

function FooterColumn({ data }: Props) {
  const linkMap: { [key: string]: string } = {
    About: "/about",
    "How it works": "/how-it-works",
    "Contact us": "/contact",
    "Help Center": "/help",
    Safety: "/safety",
    "Report an issue": "/report",
    "List your instrument": "/instruments",
    "Host resources": "/host-resources",
    "Host responsibilities": "/host-responsibilities",
    "Terms of Service": "/terms",
    "Privacy Policy": "/privacy",
    "Cancellation policy": "/cancellation-policy",
  };

  const columnItems = data.map((item, itemIndex) => {
    if (itemIndex === 0) {
      return (
        <h5
          key={itemIndex}
          className="mb-3 font-mono text-[10px] uppercase tracking-archive text-paper/60"
        >
          {item}
        </h5>
      );
    }

    const link = linkMap[item];
    if (link) {
      return (
        <Link
          key={itemIndex}
          href={link}
          className="group block py-1 font-display text-[15px] text-paper/85 transition hover:text-paper"
        >
          <span className="bg-[length:0%_1px] bg-[linear-gradient(currentColor,currentColor)] bg-[position:0_100%] bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
            {item}
          </span>
        </Link>
      );
    }

    return (
      <p key={itemIndex} className="py-1 font-display text-[15px] text-paper/85">
        {item}
      </p>
    );
  });

  return <div>{columnItems}</div>;
}

export default FooterColumn;
