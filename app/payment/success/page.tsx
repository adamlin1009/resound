"use client";

import ClientOnly from "@/components/ClientOnly";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const PaymentSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 10; // Maximum 10 retries (20 seconds total)

  useEffect(() => {
    const startCountdown = (resId: string | null) => {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Use setTimeout to avoid state update during render
            setTimeout(() => {
              if (resId) {
                router.push(`/rentals/${resId}/manage`);
              } else {
                router.push("/rentals");
              }
            }, 0);
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
            setReservationId(response.data.reservation.id);
            startCountdown(response.data.reservation.id);
          } else if (retryCountRef.current < MAX_RETRIES) {
            // Retry after 2 seconds if still processing and under retry limit
            retryCountRef.current += 1;
            setTimeout(checkPayment, 2000);
          } else {
            // Max retries reached, redirect to rentals page
            // Warning: Max retries reached
            setIsProcessing(false);
            startCountdown(null);
          }
        } catch (error) {
          // Error handled internally
          if (retryCountRef.current < MAX_RETRIES) {
            // Retry after 2 seconds
            retryCountRef.current += 1;
            setTimeout(checkPayment, 2000);
          } else {
            // Max retries reached, redirect to rentals page
            // Error handled internally
            setIsProcessing(false);
            startCountdown(null);
          }
        }
      };

      checkPayment();
    } else {
      // No session ID, just redirect
      setIsProcessing(false);
      startCountdown(null);
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
            subtitle={`Your instrument rental has been confirmed. Redirecting to your rental details in ${countdown} seconds...`}
            showReset={false}
          />
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                if (reservationId) {
                  router.push(`/rentals/${reservationId}/manage`);
                } else {
                  router.push("/rentals");
                }
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Go to Rental Details Now
            </button>
          </div>
        </div>
      </Container>
    </ClientOnly>
  );
};

export default PaymentSuccessPage;