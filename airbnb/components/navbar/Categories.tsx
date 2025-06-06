"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { FaGuitar, FaDrum, FaMusic } from "react-icons/fa";
import { GiPianoKeys, GiSaxophone, GiViolin, GiTrumpet, GiFlute, GiMicrophone, GiSoundWaves } from "react-icons/gi";
import { TbMusic } from "react-icons/tb";
import { MdPiano } from "react-icons/md";
import { BsMusicNote, BsSpeaker } from "react-icons/bs";
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

  const isMainPage = pathname === "/";

  if (!isMainPage) {
    return null;
  }

  return (
    <Container>
      <div className="pt-4 flex flex-row items-center justify-between overflow-x-auto">
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
  );
}

export default Categories;
