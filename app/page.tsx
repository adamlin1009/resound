import ClientOnly from "@/components/ClientOnly";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import ListingCard from "@/components/listing/ListingCard";
import { isDemoMode } from "@/lib/demoData";
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

  const response = await getListings(params);
  const currentUser = await getCurrentUser();
  const demoMode = isDemoMode();

  if (response.listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <section className="pt-8 pb-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-emerald-700">
                Classical instrument marketplace
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-neutral-950 md:text-5xl">
                Resound helps musicians rent performance-ready instruments with confidence.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
                Browse a curated demo inventory, inspect real marketplace flows, and try the simulated checkout,
                messaging, and rental management experience.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <div>
                <p className="text-2xl font-bold text-neutral-950">{response.totalCount}</p>
                <p className="text-xs text-neutral-500">instruments</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-950">8</p>
                <p className="text-xs text-neutral-500">categories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-950">{demoMode ? "Demo" : "Live"}</p>
                <p className="text-xs text-neutral-500">mode</p>
              </div>
            </div>
          </div>
        </section>

        <div className="pb-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-8 overflow-x-hidden">
          {response.listings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              data={listing}
              currentUser={currentUser}
              priority={index < 8}
            />
          ))}
        </div>
      </Container>
    </ClientOnly>
  );
}
