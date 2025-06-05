"use client";

import ClientOnly from "@/components/ClientOnly";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PaymentSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/trips");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <ClientOnly>
      <Container>
        <div className="pt-24">
          <EmptyState
            title="Payment Successful!"
            subtitle={`Your rental has been booked. Redirecting to your trips in ${countdown} seconds...`}
            showReset={false}
          />
          <div className="flex justify-center mt-4">
            <button
              onClick={() => router.push("/trips")}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
            >
              Go to My Trips Now
            </button>
          </div>
        </div>
      </Container>
    </ClientOnly>
  );
};

export default PaymentSuccessPage;