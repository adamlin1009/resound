"use client";

import ClientOnly from "@/components/ClientOnly";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PaymentSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    const startCountdown = () => {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/rentals");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const sessionId = searchParams?.get("session_id");
    
    if (sessionId) {
      // Check payment status
      const checkPayment = async () => {
        try {
          const response = await axios.get(`/api/payments/${sessionId}`);
          setPaymentStatus(response.data.payment.status);
          
          // If payment succeeded and reservation exists, start countdown
          if (response.data.payment.status === "SUCCEEDED" && response.data.reservation) {
            setIsProcessing(false);
            startCountdown();
          } else {
            // Retry after 2 seconds if still processing
            setTimeout(checkPayment, 2000);
          }
        } catch (error) {
          console.error("Error checking payment:", error);
          // Retry after 2 seconds
          setTimeout(checkPayment, 2000);
        }
      };

      checkPayment();
    } else {
      // No session ID, just redirect
      setIsProcessing(false);
      startCountdown();
    }
  }, [searchParams, router]);

  if (isProcessing) {
    return (
      <ClientOnly>
        <Container>
          <div className="pt-24 flex flex-col items-center justify-center">
            <Loader />
            <p className="mt-4 text-neutral-500">Processing your payment...</p>
          </div>
        </Container>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div className="pt-24">
          <EmptyState
            title="Payment Successful!"
            subtitle={`Your instrument rental has been confirmed. Redirecting to your rentals in ${countdown} seconds...`}
            showReset={false}
          />
          <div className="flex justify-center mt-4">
            <button
              onClick={() => router.push("/rentals")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Go to My Rentals Now
            </button>
          </div>
        </div>
      </Container>
    </ClientOnly>
  );
};

export default PaymentSuccessPage;