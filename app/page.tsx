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

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomeProps) {
  const awaitParams: any = await searchParams;

  let params: IListingsParams = {} as IListingsParams;

  if (awaitParams instanceof URLSearchParams) {
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
    params = {
      userId: awaitParams.userId,
      experienceLevel: awaitParams.experienceLevel
        ? Number(awaitParams.experienceLevel)
        : undefined,
      city: awaitParams.city,
      state: awaitParams.state,
      zipCode: awaitParams.zipCode,
      startDate: awaitParams.startDate,
      endDate: awaitParams.endDate,
      category: awaitParams.category,
      instrumentType: awaitParams.instrumentType,
      radius: awaitParams.radius ? Number(awaitParams.radius) : undefined,
      nationwide:
        awaitParams.nationwide === "true" || awaitParams.nationwide === true,
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

  const totalCount = response.totalCount || response.listings.length;

  return (
    <ClientOnly>
      <Container>
        {/* Editorial cover */}
        <section className="relative pb-12 pt-10 md:pb-16 md:pt-14">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left column — Issue colophon */}
            <aside className="order-2 lg:order-1 lg:col-span-3">
              <div className="flex items-center gap-3">
                <span className="archive-rule flex-1" />
                <span className="archive-label">Issue 026</span>
              </div>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-archive text-ink-muted">
                Editor's Note
              </p>
              <p className="mt-3 font-display text-[15px] leading-relaxed text-ink-soft">
                A working <span className="editorial-italic">archive</span> of
                instruments lent between musicians — from chamber-quality violins
                to studio-ready brass. Every entry is verified, dated, and
                accompanied by its custodian.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-rule pt-6 lg:grid-cols-1 lg:gap-6">
                <div>
                  <p className="archive-label">In catalogue</p>
                  <p className="mt-1 font-display text-[28px] leading-none text-ink">
                    {String(totalCount).padStart(3, "0")}
                  </p>
                </div>
                <div>
                  <p className="archive-label">Categories</p>
                  <p className="mt-1 font-display text-[28px] leading-none text-ink">
                    08
                  </p>
                </div>
                <div>
                  <p className="archive-label">Mode</p>
                  <p className="mt-1 font-display text-[28px] leading-none text-ink">
                    {demoMode ? (
                      <span className="editorial-italic text-lacquer">Demo</span>
                    ) : (
                      "Live"
                    )}
                  </p>
                </div>
              </div>
            </aside>

            {/* Right — Masthead */}
            <div className="order-1 lg:order-2 lg:col-span-9">
              <div className="flex items-center gap-4">
                <span className="archive-label">№ MMXXVI · The Resound Archive</span>
                <span className="archive-rule flex-1" />
              </div>

              <h1 className="mt-6 font-display text-[44px] leading-[0.96] tracking-[-0.02em] text-ink sm:text-[68px] md:text-[88px] lg:text-[104px]">
                <span className="block animate-rise-in">Instruments,</span>
                <span
                  className="block animate-rise-in"
                  style={{ animationDelay: "120ms" }}
                >
                  <span className="editorial-italic font-normal text-lacquer">
                    rarely
                  </span>{" "}
                  <span>borrowed.</span>
                </span>
                <span
                  className="block animate-rise-in"
                  style={{ animationDelay: "240ms" }}
                >
                  Always{" "}
                  <span className="editorial-italic font-normal text-brass-deep">
                    cared&nbsp;for.
                  </span>
                </span>
              </h1>

              <div
                className="mt-10 flex flex-col gap-6 border-t border-rule pt-6 md:flex-row md:items-end md:justify-between animate-rise-in"
                style={{ animationDelay: "360ms" }}
              >
                <p className="max-w-xl font-display text-[17px] leading-relaxed text-ink-soft">
                  A peer marketplace for chamber musicians, soloists, and
                  studios — where each lent instrument is recorded like a piece
                  in a private collection.
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-lacquer" />
                    <span className="archive-label">
                      {demoMode ? "Demo open" : "Now lending"}
                    </span>
                  </div>
                  <a
                    href="/how-it-works"
                    className="group inline-flex items-center gap-2 border-b border-ink pb-1 font-mono text-[11px] uppercase tracking-archive text-ink"
                  >
                    The Method
                    <span className="transition group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalogue header */}
        <section
          className="flex flex-col gap-3 border-y border-rule py-4 md:flex-row md:items-center md:justify-between md:gap-6"
        >
          <div className="flex items-center gap-3">
            <span className="archive-label">The Catalogue</span>
            <span className="editorial-italic text-[18px] text-ink-muted">
              ({String(totalCount).padStart(3, "0")} listings)
            </span>
          </div>
          <div className="flex items-center gap-4 text-ink-muted">
            <span className="font-mono text-[10px] uppercase tracking-archive">
              Sorted by recency
            </span>
            <span className="hidden h-3 w-px bg-rule md:inline" />
            <span className="hidden font-mono text-[10px] uppercase tracking-archive md:inline">
              Press a card to inspect
            </span>
          </div>
        </section>

        {/* Listings grid */}
        <div className="grid grid-cols-1 gap-6 overflow-x-hidden pb-20 pt-8 sm:grid-cols-2 md:grid-cols-3 md:gap-7 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
          {response.listings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              data={listing}
              currentUser={currentUser}
              priority={index < 8}
              index={index}
            />
          ))}
        </div>
      </Container>
    </ClientOnly>
  );
}
