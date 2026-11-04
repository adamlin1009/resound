"use client";

import useLoginModel from "@/hook/useLoginModal";
import useRegisterModal from "@/hook/useRegisterModal";
import { signIn } from "next-auth/react";
import { useCallback, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";

import Button from "../Button";
import Heading from "../Heading";
import Modal from "./Modal";

function LoginModal() {
  const registerModel = useRegisterModal();
  const loginModel = useLoginModel();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = useCallback(() => {
    setIsLoading(true);

    signIn("google", {
      callbackUrl: window.location.href,
    }).catch(() => {
      setIsLoading(false);
      toast.error("Unable to start Google login");
    });
  }, []);

  const toggle = useCallback(() => {
    loginModel.onClose();
    registerModel.onOpen();
  }, [loginModel, registerModel]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading title="Welcome Back" subtitle="Sign in to your account!" center />
      <div className="flex justify-center mt-4">
        <Button
          outline
          label="Continue with Google"
          icon={FcGoogle}
          disabled={isLoading}
          onClick={handleGoogleLogin}
        />
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4">
      <div className="text-neutral-500 text-center font-light">
        <div>
          {`Don't have an account?`}{" "}
          <span
            onClick={toggle}
            className="text-neutral-800 cursor-pointer hover:underline"
          >
            Create an account
          </span>
        </div>
      </div>
    </div>
  );
  return (
    <Modal
      disabled={isLoading}
      isOpen={loginModel.isOpen}
      title="Login"
      actionLabel=""
      onClose={loginModel.onClose}
      onSubmit={handleGoogleLogin}
      body={bodyContent}
      footer={footerContent}
    />
  );
}

export default LoginModal;
