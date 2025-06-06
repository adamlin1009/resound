"use client"

import Link from "next/link";

type Props = {
    index: number;
    data: Array<string>;
  };

function FooterColumn({ index, data }: Props) {
    // Map of footer text to routes
    const linkMap: { [key: string]: string } = {
      "About": "/about",
      "How it works": "/how-it-works",
      "Contact us": "/contact",
      "Help Center": "/help",
      "Safety": "/safety",
      "Report an issue": "/report",
      "List your instrument": "/instruments",
      "Host resources": "/host-resources",
      "Host responsibilities": "/host-responsibilities",
      "Terms of Service": "/terms",
      "Privacy Policy": "/privacy",
      "Cancellation policy": "/cancellation-policy"
    };

    const columnItems = data.map((item, itemIndex) => {
        if (itemIndex === 0) {
            return <h5 key={itemIndex} className="font-bold">{item}</h5>;
        }
        
        const link = linkMap[item];
        if (link) {
            return (
                <Link 
                    key={itemIndex} 
                    href={link}
                    className="block hover:underline cursor-pointer"
                >
                    {item}
                </Link>
            );
        }
        
        return <p key={itemIndex}>{item}</p>;
    });

    return (
      <div className="space-y-4 text-xs text-gray-800">
        <div>
          {columnItems}
        </div>
      </div>
    );
}

export default FooterColumn;