"use client";

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Input from "@/components/inputs/Input";
import Button from "@/components/Button";
import { useState } from "react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { BiEnvelope, BiHelpCircle, BiShield } from "react-icons/bi";

const ContactPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      reset();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-amber-50 py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-700">
              Have a question or need help? We&apos;re here for you.
            </p>
          </div>
        </Container>
      </div>

      {/* Contact Options */}
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BiHelpCircle className="text-2xl text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">General Support</h3>
              <p className="text-gray-600 text-sm mb-3">
                For questions about rentals, listings, or using Resound
              </p>
              <a 
                href="/help" 
                className="text-amber-600 hover:underline text-sm font-medium"
              >
                Visit Help Center →
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BiShield className="text-2xl text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Trust & Safety</h3>
              <p className="text-gray-600 text-sm mb-3">
                Report safety concerns or suspicious activity
              </p>
              <a 
                href="/report" 
                className="text-amber-600 hover:underline text-sm font-medium"
              >
                Report an issue →
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BiEnvelope className="text-2xl text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Business Inquiries</h3>
              <p className="text-gray-600 text-sm mb-3">
                Partnerships, press, or other business matters
              </p>
              <p className="text-amber-600 text-sm font-medium">
                Use form below
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <Heading
              title="Send us a message"
              subtitle="We typically respond within 24-48 hours"
              center
            />
            
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="name"
                  label="Your Name"
                  disabled={isLoading}
                  register={register}
                  errors={errors}
                  required
                />
                
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  disabled={isLoading}
                  register={register}
                  errors={errors}
                  required
                />
              </div>
              
              <Input
                id="subject"
                label="Subject"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  disabled={isLoading}
                  {...register("message", { required: true })}
                  className={`
                    w-full
                    px-4
                    py-3
                    text-gray-900
                    border
                    rounded-lg
                    focus:outline-none
                    focus:ring-2
                    focus:ring-amber-500
                    focus:border-transparent
                    disabled:opacity-70
                    disabled:cursor-not-allowed
                    ${errors["message"] ? "border-red-500" : "border-gray-300"}
                  `}
                  placeholder="How can we help you?"
                />
                {errors["message"] && (
                  <p className="mt-1 text-sm text-red-500">This field is required</p>
                )}
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative disabled:opacity-70 disabled:cursor-not-allowed rounded-lg hover:opacity-80 transition w-full bg-amber-700 text-white py-3 font-semibold"
                >
                  {isLoading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Container>

      {/* Additional Info */}
      <div className="bg-gray-50 py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Other ways to get help</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong>For urgent safety issues:</strong> If you&apos;re experiencing an 
                emergency, please contact local authorities immediately.
              </p>
              <p>
                <strong>For payment issues:</strong> Check your email for receipts 
                from Stripe, or visit your account settings to view payment history.
              </p>
              <p>
                <strong>For account access:</strong> Try resetting your password 
                first. If you&apos;re still having trouble, include your account email 
                in the contact form above.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default ContactPage;