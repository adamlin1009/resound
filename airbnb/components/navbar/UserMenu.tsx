"use client";

import useLoginModel from "@/hook/useLoginModal";
import useRegisterModal from "@/hook/useRegisterModal";
import useRentModal from "@/hook/useRentModal";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { SafeUser } from "@/types";
import { signOut } from "next-auth/react";
import { useCallback, useState } from "react";
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

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const onRent = useCallback(() => {
    if (!currentUser) {
      return loginModel.onOpen();
    }

    rentModel.onOpen();
  }, [currentUser, loginModel, rentModel]);

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">
        <div
          className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
          onClick={onRent}
        >
          Lend your instrument
        </div>
        <div
          onClick={toggleOpen}
          className="p-4 md:py-1 md:px-2 border-[1px] flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
        >
          <AiOutlineMenu />
          <div className="hidden md:block">
            {currentUser ? (
              <Avatar src={currentUser?.image!} userName={currentUser?.name} />
            ) : (
              <Image
                className="rounded-full"
                height="30"
                width="30"
                alt="Avatar"
                src="/assets/avatar.png"
              />
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute rounded-xl shadow-md w-[40vw] md:w-3/4 bg-white overflow-hidden right-0 top-12 text-sm">
          <div className="flex flex-col cursor-pointer">
            {currentUser ? (
              <>
                <MenuItem
                  onClick={() => router.push("/rentals")}
                  label="My rentals"
                />
                <MenuItem
                  onClick={() => router.push("/reservations")}
                  label="Incoming rentals"
                />
                <MenuItem
                  onClick={() => router.push("/favorites")}
                  label="My favorites"
                />
                <MenuItem
                  onClick={() => router.push("/messages")}
                  label="Messages"
                />
                <MenuItem
                  onClick={() => router.push("/instruments")}
                  label="My instruments"
                />
                <MenuItem onClick={onRent} label="Lend your instrument" />
                {currentUser?.isAdmin && (
                  <>
                    <hr />
                    <MenuItem
                      onClick={() => router.push("/admin")}
                      label="Admin Panel"
                    />
                  </>
                )}
                <hr />
                <MenuItem onClick={() => signOut()} label="Logout" />
              </>
            ) : (
              <>
                <MenuItem onClick={loginModel.onOpen} label="Login" />
                <MenuItem onClick={registerModel.onOpen} label="Sign up" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
