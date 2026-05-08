"use client";

import useLoginModel from "@/hook/useLoginModal";
import useRegisterModal from "@/hook/useRegisterModal";
import useRentModal from "@/hook/useRentModal";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { SafeUser } from "@/types";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import Avatar from "../Avatar";
import MenuItem from "./MenuItem";

type Props = {
  currentUser?: SafeUser | null;
};

function UserMenu({ currentUser }: Props) {
  const router = useRouter();
  const registerModel = useRegisterModal();
  const loginModel = useLoginModel();
  const rentModel = useRentModal();
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isDemoMode = process.env.NEXT_PUBLIC_RESOUND_DEMO === "true";

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [isOpen]);

  const onRent = useCallback(() => {
    if (!currentUser) {
      setIsOpen(false);
      return loginModel.onOpen();
    }
    setIsOpen(false);
    rentModel.onOpen();
  }, [currentUser, loginModel, rentModel]);

  const openLogin = useCallback(() => {
    setIsOpen(false);
    loginModel.onOpen();
  }, [loginModel]);

  const openRegister = useCallback(() => {
    setIsOpen(false);
    registerModel.onOpen();
  }, [registerModel]);

  return (
    <div className="relative" ref={wrapRef}>
      <div className="flex flex-row items-center gap-3">
        <button
          onClick={onRent}
          className="hidden font-mono text-[11px] uppercase tracking-archive text-ink-soft transition hover:text-lacquer md:block"
        >
          <span className="editorial-italic text-[14px] not-italic tracking-normal">→</span>{" "}
          Lend an instrument
        </button>
        <button
          onClick={toggleOpen}
          className="flex items-center gap-3 border border-ink/20 bg-paper-ivory px-3 py-2 transition hover:border-ink"
        >
          <AiOutlineMenu className="text-ink" />
          <span className="hidden md:block">
            {currentUser ? (
              <Avatar src={currentUser?.image} userName={currentUser?.name} />
            ) : (
              <Image
                className="rounded-full"
                height="28"
                width="28"
                alt="Avatar"
                src="/assets/avatar.png"
              />
            )}
          </span>
        </button>
      </div>
      {isOpen && (
        <div className="absolute right-0 top-12 w-[260px] origin-top-right border border-ink/15 bg-paper-ivory shadow-lift animate-fade-in">
          <div className="flex items-center justify-between border-b border-rule px-5 py-3">
            <span className="archive-label">Reader&apos;s Folio</span>
            {currentUser && (
              <span className="font-mono text-[10px] uppercase tracking-archive text-ink-faint">
                Signed in
              </span>
            )}
          </div>
          <div className="flex flex-col">
            {currentUser ? (
              <>
                <MenuItem onClick={() => router.push("/rentals")} label="My rentals" />
                <MenuItem onClick={() => router.push("/reservations")} label="Incoming rentals" />
                <MenuItem onClick={() => router.push("/favorites")} label="My favourites" />
                <MenuItem onClick={() => router.push("/messages")} label="Messages" />
                <MenuItem onClick={() => router.push("/instruments")} label="My instruments" />
                <MenuItem onClick={onRent} label="Lend your instrument" />
                <hr className="border-rule" />
                <MenuItem onClick={() => router.push("/profile")} label="My profile" />
                {currentUser?.isAdmin && (
                  <>
                    <hr className="border-rule" />
                    <MenuItem onClick={() => router.push("/admin")} label="Admin panel" />
                  </>
                )}
                <hr className="border-rule" />
                {isDemoMode ? (
                  <MenuItem onClick={() => {}} label="Demo session active" />
                ) : (
                  <MenuItem onClick={() => signOut()} label="Sign out" />
                )}
              </>
            ) : (
              <>
                <MenuItem onClick={openLogin} label="Sign in" />
                <MenuItem onClick={openRegister} label="Open an account" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
