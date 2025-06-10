"use client";

import { SafeUser } from "@/types";
import Container from "../Container";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from "./UserMenu";
import Categories from "./Categories";

type Props = {
  currentUser?: SafeUser | null;
};

function Navbar({ currentUser }: Props) {
  return (
    <div className="fixed w-full bg-white z-10 shadow-sm">
      <div className="py-4 border-b-[1px]">
        <Container>
          <div className="grid grid-cols-3 items-center gap-3 md:gap-0">
            <div className="flex justify-start">
              <Logo />
            </div>
            <div className="flex justify-center">
              <Search />
            </div>
            <div className="flex justify-end">
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
        </Container>
      </div>
      <Categories />
    </div>
  );
}

export default Navbar;
