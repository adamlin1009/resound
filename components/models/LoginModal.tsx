"use client";

import useLoginModel from "@/hook/useLoginModal";
import useRegisterModal from "@/hook/useRegisterModal";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { AiFillFacebook } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";

import Button from "../Button";
import Heading from "../Heading";
import Input from "../inputs/Input";
import Modal from "./Modal";

type Props = {};

function LoginModal({}: Props) {
  const router = useRouter();
  const registerModel = useRegisterModal();
  const loginModel = useLoginModel();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    signIn("credentials", {
      ...data,
      redirect: false,
    }).then((callback) => {
      setIsLoading(false);

      if (callback?.ok) {
        toast.success("Login Successfully");
        router.refresh();
        loginModel.onClose();
      } else if (callback?.error) {
        toast.error("Something Went Wrong");
      }
    });
  };

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
          onClick={() => signIn("google")}
        />
      </div>
      {/* <Input
        id="email"
        label="Email Address"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="password"
        label="Password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      /> */}
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4">
      {/* <Button
        outline
        label="Continue with Facebook"
        icon={AiFillFacebook}
        onClick={() => signIn("facebook")}
        isColor
      /> */}
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
      onSubmit={() => {}}
      body={bodyContent}
      footer={footerContent}
    />
  );
}

export default LoginModal;
