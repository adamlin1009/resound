"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { FaDrum, FaMusic } from "react-icons/fa";
import {
  GiPianoKeys,
  GiSaxophone,
  GiViolin,
  GiTrumpet,
  GiMicrophone,
  GiSoundWaves,
} from "react-icons/gi";
import CategoryBox from "../CategoryBox";
import Container from "../Container";

export const categories = [
  {
    label: "Strings",
    icon: GiViolin,
    description: "Violins, guitars, cellos, basses, and more!",
  },
  {
    label: "Percussion",
    icon: FaDrum,
    description: "Drums, timpani, xylophones, and percussion!",
  },
  {
    label: "Woodwinds",
    icon: GiSaxophone,
    description: "Flutes, clarinets, oboes, saxophones, and more!",
  },
  {
    label: "Brass",
    icon: GiTrumpet,
    description: "Trumpets, trombones, tubas, french horns, and more!",
  },
  {
    label: "Keyboards",
    icon: GiPianoKeys,
    description: "Pianos, organs, synthesizers, and keyboards!",
  },
  {
    label: "Electronic",
    icon: GiSoundWaves,
    description: "DJ equipment, interfaces, and electronic instruments!",
  },
  {
    label: "Recording",
    icon: GiMicrophone,
    description: "Microphones, interfaces, and studio equipment!",
  },
  {
    label: "Other",
    icon: FaMusic,
    description: "Other musical instruments and equipment!",
  },
];

type Props = {};

function Categories({}: Props) {
  const params = useSearchParams();
  const category = params?.get("category");
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <div className="border-t border-rule/70 bg-paper">
      <Container>
        <div className="flex items-center gap-6 overflow-x-auto py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-ink/20">
          <span className="archive-label hidden shrink-0 pr-3 sm:inline">
            Index ·
          </span>
          {categories.map((items, index) => (
            <CategoryBox
              key={index}
              icon={items.icon}
              label={items.label}
              selected={category === items.label}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}

export default Categories;
