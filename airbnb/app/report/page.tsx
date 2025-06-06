"use client";

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Input from "@/components/inputs/Input";
import Button from "@/components/Button";
import { useState } from "react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { BiAlarm, BiShield, BiUserX, BiErrorCircle } from "react-icons/bi";

const ReportPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [issueType, setIssueType] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FieldValues>({
    defaultValues: {
      reporterEmail: "",
      issueType: "",
      listingId: "",
      userId: "",
      description: "",
      evidence: "",
    },
  });

  const issueTypes = [
    { value: "safety", label: "Safety concern", icon: BiShield },
    { value: "scam", label: "Suspected scam or fraud", icon: BiErrorCircle },
    { value: "inappropriate", label: "Inappropriate behavior", icon: BiUserX },
    { value: "damaged", label: "Damaged instrument", icon: BiAlarm },
    { value: "other", label: "Other issue", icon: BiErrorCircle },
  ];

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success("Report submitted. We'll investigate and follow up within 24-48 hours.");
      reset();
      setIssueType("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-red-50 py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Report an Issue
            </h1>
            <p className="text-xl text-gray-700">
              Help us maintain a safe and trustworthy community by reporting 
              any concerns or violations.
            </p>
          </div>
        </Container>
      </div>

      {/* Urgent Notice */}
      <div className="bg-red-600 text-white py-4">
        <Container>
          <div className="flex items-center justify-center gap-3">
            <BiAlarm className="text-2xl" />
            <p className="font-medium">
              If you're in immediate danger, please contact local emergency services (911) first.
            </p>
          </div>
        </Container>
      </div>

      {/* Report Form */}
      <Container>
        <div className="py-16">
          <div className="max-w-2xl mx-auto">
            <Heading
              title="Submit a Report"
              subtitle="All reports are confidential and reviewed by our safety team"
              center
            />
            
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {/* Issue Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What type of issue are you reporting? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {issueTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setIssueType(type.value)}
                        className={`
                          p-4 rounded-lg border-2 text-left transition
                          ${issueType === type.value 
                            ? "border-amber-600 bg-amber-50" 
                            : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`text-xl ${
                            issueType === type.value ? "text-amber-600" : "text-gray-400"
                          }`} />
                          <span className={`text-sm font-medium ${
                            issueType === type.value ? "text-amber-900" : "text-gray-700"
                          }`}>
                            {type.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <input 
                  type="hidden" 
                  {...register("issueType", { required: true })}
                  value={issueType}
                />
                {errors["issueType"] && (
                  <p className="mt-2 text-sm text-red-500">Please select an issue type</p>
                )}
              </div>
              
              {/* Contact Email */}
              <Input
                id="reporterEmail"
                label="Your Email Address"
                type="email"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
              />
              
              {/* Related Listing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Listing ID (if applicable)
                </label>
                <input
                  id="listingId"
                  type="text"
                  disabled={isLoading}
                  {...register("listingId")}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., 684244281b5050feac3fd9fe"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You can find this in the listing URL or booking confirmation
                </p>
              </div>
              
              {/* Related User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related User Email (if applicable)
                </label>
                <input
                  id="userId"
                  type="text"
                  disabled={isLoading}
                  {...register("userId")}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., user@example.com"
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the issue in detail *
                </label>
                <textarea
                  id="description"
                  rows={6}
                  disabled={isLoading}
                  {...register("description", { required: true, minLength: 20 })}
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
                    ${errors["description"] ? "border-red-500" : "border-gray-300"}
                  `}
                  placeholder="Please provide as much detail as possible about what happened, when it occurred, and any relevant context..."
                />
                {errors["description"] && (
                  <p className="mt-1 text-sm text-red-500">
                    Please provide a detailed description (at least 20 characters)
                  </p>
                )}
              </div>
              
              {/* Evidence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional evidence or links
                </label>
                <textarea
                  id="evidence"
                  rows={3}
                  disabled={isLoading}
                  {...register("evidence")}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Links to messages, photos, or any other relevant evidence..."
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !issueType}
                  className="relative disabled:opacity-70 disabled:cursor-not-allowed rounded-lg hover:opacity-80 transition w-full bg-amber-700 text-white py-3 font-semibold"
                >
                  {isLoading ? "Submitting Report..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Container>

      {/* What Happens Next */}
      <div className="bg-gray-50 py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <Heading
              title="What happens after you report?"
              subtitle="Our investigation process"
              center
            />
            
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-600">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Immediate Review</h3>
                  <p className="text-gray-600">
                    Our safety team reviews all reports within 24 hours. Urgent safety 
                    issues are prioritized.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-600">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Investigation</h3>
                  <p className="text-gray-600">
                    We gather information from all parties involved and review any 
                    evidence provided.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-600">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Action & Follow-up</h3>
                  <p className="text-gray-600">
                    We take appropriate action based on our findings and follow up 
                    with you about the resolution.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Privacy Notice:</strong> Your report is confidential. We only 
                share information with involved parties as necessary to investigate and 
                resolve the issue. False reports may result in account suspension.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default ReportPage;