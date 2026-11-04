"use client";

import useLoginModel from "@/hook/useLoginModal";
import useRegisterModal from "@/hook/useRegisterModal";
import { useCallback, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";

import { signIn } from "next-auth/react";
import Button from "../Button";
import Heading from "../Heading";
import Modal from "./Modal";

function RegisterModal() {
  const registerModel = useRegisterModal();
  const loginModel = useLoginModel();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = useCallback(() => {
    setIsLoading(true);

    signIn("google", {
      callbackUrl: window.location.href,
    }).catch(() => {
      setIsLoading(false);
      toast.error("Unable to start Google login");
    });
  }, []);

  const toggle = useCallback(() => {
    loginModel.onOpen();
    registerModel.onClose();
  }, [loginModel, registerModel]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Welcome to Resound"
        subtitle="Create an account!"
        center
      />
      <div className="flex justify-center mt-4">
        <Button
          outline
          label="Continue with Google"
          icon={FcGoogle}
          disabled={isLoading}
          onClick={handleGoogleSignIn}
        />
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4">
      <div className="text-neutral-500 text-center font-light">
        <div>
          Already have an account?{" "}
          <span
            onClick={toggle}
            className="text-neutral-800 cursor-pointer hover:underline"
          >
            Log in
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModel.isOpen}
      title="Register"
      actionLabel=""
      onClose={registerModel.onClose}
      onSubmit={handleGoogleSignIn}
      body={bodyContent}
      footer={footerContent}
    />
  );
}

export default RegisterModal;
