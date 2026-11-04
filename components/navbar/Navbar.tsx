"use client";

import { SafeUser } from "@/types";
import { isDemoMode } from "@/lib/demo";
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
    <div className="fixed w-full bg-white z-50 shadow-sm">
      {isDemoMode && (
        <aside
          aria-label="Demo mode notice"
          className="h-20 sm:h-12 px-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 bg-amber-100 text-amber-950 text-center text-sm"
        >
          <span className="font-bold whitespace-nowrap">Demo mode</span>
          <span>Test bookings and payments only. No real rentals or charges.</span>
        </aside>
      )}
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
