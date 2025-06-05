"use client";

import ClientOnly from "@/components/ClientOnly";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "next/navigation";

const PaymentCancelPage = () => {
  const router = useRouter();

  return (
    <ClientOnly>
      <Container>
        <div className="pt-24">
          <EmptyState
            title="Payment Cancelled"
            subtitle="Your payment was cancelled. You can try again when you're ready."
            showReset={false}
          />
          <div className="flex justify-center mt-4 gap-4">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-neutral-200 text-black rounded-lg hover:bg-neutral-300 transition"
            >
              Browse Instruments
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </Container>
    </ClientOnly>
  );
};

export default PaymentCancelPage;