import {
  createDemoMessage,
  getDemoCurrentUser,
  getDemoListingById,
  getDemoListings,
  getDemoOwnerReservations,
  getDemoPaymentStatus,
  getDemoReservationById,
  getDemoReservations,
} from "@/lib/demoData";

describe("portfolio demo data", () => {
  it("returns a browseable marketplace response", () => {
    const response = getDemoListings({ nationwide: true });

    expect(response.listings.length).toBeGreaterThan(0);
    expect(response.totalCount).toBe(response.listings.length);
    expect(response.listings[0]).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^demo-/),
        imageSrc: expect.any(Array),
        pickupStartTime: expect.any(String),
      })
    );
  });

  it("hydrates listing owners and addresses for detail pages", () => {
    const listing = getDemoListingById("demo-listing-cello");

    expect(listing?.user.name).toBe("Maya Chen");
    expect(listing?.imageSrc.length).toBeGreaterThan(1);
  });

  it("supports renter, owner, and checkout reservation flows", () => {
    const currentUser = getDemoCurrentUser();
    const renterReservations = getDemoReservations({ userId: currentUser.id });
    const ownerReservations = getDemoOwnerReservations(currentUser.id);
    const checkoutPayment = getDemoPaymentStatus("demo-checkout-demo-listing-sax");
    const checkoutReservation = getDemoReservationById(checkoutPayment.reservation.id);

    expect(renterReservations.reservations.length).toBeGreaterThan(0);
    expect(ownerReservations.pendingSetups).toBe(1);
    expect(checkoutPayment.payment.status).toBe("SUCCEEDED");
    expect(checkoutReservation?.listingId).toBe("demo-listing-sax");
    expect(checkoutReservation?.isRenter).toBe(true);
  });

  it("creates mock messages with the demo user as sender", () => {
    const message = createDemoMessage("demo-conversation-cello", "Can I pick up at noon?");

    expect(message).toEqual(
      expect.objectContaining({
        conversationId: "demo-conversation-cello",
        senderId: "demo-user-adam",
        content: "Can I pick up at noon?",
      })
    );
  });
});
