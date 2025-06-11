"use client";

import useLoginModel from "@/hook/useLoginModal";
import { SafeReservation, SafeUser, safeListing } from "@/types";
import axios from "axios";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Range } from "react-date-range";
import { toast } from "react-toastify";

import Container from "./Container";
import ListingHead from "./listing/ListingHead";
import ListingInfo from "./listing/ListingInfo";
import ListingReservation from "./listing/ListingReservation";
import { categories } from "./navbar/Categories";
import ImageGalleryModal from "./ui/ImageGalleryModal";
import QRCodeUpload from "./listing/QRCodeUpload";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

type Props = {
  reservations?: SafeReservation[];
  listing: safeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
  hasPaidReservation?: boolean;
  exactAddress?: string;
};

function ListingClient({ reservations = [], listing, currentUser, hasPaidReservation = false, exactAddress }: Props) {
  const router = useRouter();
  const loginModal = useLoginModel();

  const disableDates = useMemo(() => {
    let dates: Date[] = [];

    reservations.forEach((reservation) => {
      const range = eachDayOfInterval({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
      });

      dates = [...dates, ...range];
    });

    return dates;
  }, [reservations]);

  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(listing.price);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);
  const [selectedPickupTime, setSelectedPickupTime] = useState("");
  const [selectedReturnTime, setSelectedReturnTime] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const onCreateReservation = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    // Prevent owners from booking their own listings
    if (currentUser.id === listing.user.id) {
      toast.error("You cannot rent your own instrument");
      return;
    }

    setIsLoading(true);

    axios
      .post("/api/create-checkout-session", {
        totalPrice,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        listingId: listing?.id,
        pickupTime: selectedPickupTime,
        returnTime: selectedReturnTime,
      })
      .then((response) => {
        const { url } = response.data;
        if (url) {
          // Redirect to Stripe checkout
          window.location.href = url;
        } else {
          toast.error("Failed to create checkout session");
          setIsLoading(false);
        }
      })
      .catch(() => {
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
      });
  }, [totalPrice, dateRange, listing?.id, currentUser, loginModal, listing.user.id, selectedPickupTime, selectedReturnTime]);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const dayCount = differenceInCalendarDays(
        dateRange.endDate,
        dateRange.startDate
      );

      if (dayCount && listing.price) {
        setTotalPrice(dayCount * listing.price);
      } else {
        setTotalPrice(listing.price);
      }
    }
  }, [dateRange, listing.price]);

  const category = useMemo(() => {
    return categories.find((item) => item.label === listing.category);
  }, [listing.category]);

  const handleImageClick = useCallback((index: number) => {
    setGalleryStartIndex(index);
    setGalleryOpen(true);
  }, []);

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col gap-6">
          <ListingHead
            title={listing.title}
            imageSrc={listing.imageSrc}
            city={listing.city}
            state={listing.state}
            zipCode={listing.zipCode}
            id={listing.id}
            currentUser={currentUser}
            onImageClick={handleImageClick}
          />
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            <ListingInfo
              user={listing.user}
              category={category}
              description={listing.description}
              experienceLevel={listing.experienceLevel}
              instrumentType={listing.instrumentType}
              city={listing.city}
              state={listing.state}
              zipCode={listing.zipCode}
              listingId={listing.id}
              currentUser={currentUser}
              hasPaidReservation={hasPaidReservation}
              exactAddress={exactAddress}
            />
            <div className="order-first mb-10 md:order-last md:col-span-3">
              {currentUser && currentUser.id === listing.user.id ? (
                <div className="bg-white rounded-xl border-[1px] border-neutral-200 p-6">
                  <p className="text-lg font-semibold mb-2">This is your listing</p>
                  <p className="text-neutral-500 mb-4">You cannot rent your own instrument.</p>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Manage Images</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-3">
                        Current images: {listing.imageSrc.length} / 10
                      </p>
                      <QRCodeUpload
                        listingId={listing.id}
                        listingTitle={listing.title}
                        onImagesAdded={() => router.refresh()}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Scan a QR code to upload images to your listing
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <ListingReservation
                  price={listing.price}
                  totalPrice={totalPrice}
                  onChangeDate={(value) => setDateRange(value)}
                  dateRange={dateRange}
                  onSubmit={onCreateReservation}
                  disabled={isLoading}
                  disabledDates={disableDates}
                  pickupStartTime={listing.pickupStartTime || undefined}
                  pickupEndTime={listing.pickupEndTime || undefined}
                  returnStartTime={listing.returnStartTime || undefined}
                  returnEndTime={listing.returnEndTime || undefined}
                  availableDays={listing.availableDays}
                  onTimeChange={(pickupTime, returnTime) => {
                    setSelectedPickupTime(pickupTime);
                    setSelectedReturnTime(returnTime);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {galleryOpen && listing.imageSrc && listing.imageSrc.length > 0 && (
        <ImageGalleryModal
          images={listing.imageSrc}
          initialIndex={galleryStartIndex}
          onClose={() => setGalleryOpen(false)}
          title={listing.title}
        />
      )}
    </Container>
  );
}

export default ListingClient;
