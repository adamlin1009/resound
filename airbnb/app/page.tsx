import ClientOnly from "@/components/ClientOnly";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import ListingCard from "@/components/listing/ListingCard";
import getCurrentUser from "./actions/getCurrentUser";
import getListings, { IListingsParams } from "./actions/getListings";

interface HomeProps {
  searchParams: Promise<URLSearchParams | IListingsParams>;
}

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: HomeProps) {
  // Await searchParams because in Next.js 15 it is provided as a Promise
  const awaitParams: any = await searchParams;

  let params: IListingsParams = {} as IListingsParams;

  if (awaitParams instanceof URLSearchParams) {
    // Convert URLSearchParams to our expected object shape
    const getNum = (key: string) => {
      const val = awaitParams.get(key);
      return val ? Number(val) : undefined;
    };

    params = {
      userId: awaitParams.get("userId") || undefined,
      conditionRating: getNum("conditionRating"),
      experienceLevel: getNum("experienceLevel"),
      city: awaitParams.get("city") || undefined,
      state: awaitParams.get("state") || undefined,
      zipCode: awaitParams.get("zipCode") || undefined,
      startDate: awaitParams.get("startDate") || undefined,
      endDate: awaitParams.get("endDate") || undefined,
      category: awaitParams.get("category") || undefined,
      instrumentType: awaitParams.get("instrumentType") || undefined,
      radius: getNum("radius"),
      nationwide: awaitParams.get("nationwide") === "true",
    };
  } else {
    // Already an object (from client navigation)
    params = {
      userId: awaitParams.userId,
      conditionRating: awaitParams.conditionRating ? Number(awaitParams.conditionRating) : undefined,
      experienceLevel: awaitParams.experienceLevel ? Number(awaitParams.experienceLevel) : undefined,
      city: awaitParams.city,
      state: awaitParams.state,
      zipCode: awaitParams.zipCode,
      startDate: awaitParams.startDate,
      endDate: awaitParams.endDate,
      category: awaitParams.category,
      instrumentType: awaitParams.instrumentType,
      radius: awaitParams.radius ? Number(awaitParams.radius) : undefined,
      nationwide: awaitParams.nationwide === "true" || awaitParams.nationwide === true,
    };
  }

  const listings = await getListings(params);
  const currentUser = await getCurrentUser();

  if (listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div className="pt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-8 overflow-x-hidden">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              data={listing}
              currentUser={currentUser}
            />
          ))}
        </div>
      </Container>
    </ClientOnly>
  );
}
