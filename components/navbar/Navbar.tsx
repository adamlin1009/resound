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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div
        aria-hidden
        className="hidden border-b border-rule/70 bg-paper-warm/50 md:block"
      >
        <Container>
          <div className="flex items-center justify-between py-1.5 font-mono text-[10px] uppercase tracking-archive text-ink-muted">
            <span>The Resound Archive · A Catalogue of Lent Instruments</span>
            <span className="flex items-center gap-4">
              <span className="hidden md:inline">
                Curated from private studios &amp; conservatories
              </span>
              <span className="text-ink">№ MMXXVI</span>
            </span>
          </div>
        </Container>
      </div>
      <div className="py-3">
        <Container>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-8">
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
    </header>
  );
}

export default Navbar;
