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
    label: "Guitar",
    icon: FaGuitar,
    description: "Acoustic and electric guitars available!",
  },
  {
    label: "Piano",
    icon: GiPianoKeys,
    description: "Grand, upright, and digital pianos!",
  },
  {
    label: "Drums",
    icon: FaDrum,
    description: "Full drum kits and percussion instruments!",
  },
  {
    label: "Violin",
    icon: GiViolin,
    description: "String instruments including violins and violas!",
  },
  {
    label: "Saxophone",
    icon: GiSaxophone,
    description: "Saxophones and other woodwind instruments!",
  },
  {
    label: "Trumpet",
    icon: GiTrumpet,
    description: "Brass instruments including trumpets and trombones!",
  },
  {
    label: "Keyboard",
    icon: MdPiano,
    description: "Synthesizers and electronic keyboards!",
  },
  {
    label: "Bass",
    icon: FaMusic,
    description: "Electric and acoustic bass guitars!",
  },
  {
    label: "Flute",
    icon: GiFlute,
    description: "Flutes and other wind instruments!",
  },
  {
    label: "Microphone",
    icon: GiMicrophone,
    description: "Professional microphones and recording equipment!",
  },
  {
    label: "DJ Equipment",
    icon: GiSoundWaves,
    description: "Turntables, mixers, and DJ controllers!",
  },
  {
    label: "Audio Interface",
    icon: BsSpeaker,
    description: "Recording interfaces and studio equipment!",
  },
  {
    label: "Ukulele",
    icon: BsMusicNote,
    description: "Ukuleles and other small string instruments!",
  },
  {
    label: "Amplifier",
    icon: BsSpeaker,
    description: "Guitar and bass amplifiers!",
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
