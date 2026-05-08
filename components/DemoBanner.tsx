import Link from "next/link";
import { TbArchive, TbExternalLink } from "react-icons/tb";

export default function DemoBanner() {
  if (process.env.NEXT_PUBLIC_RESOUND_DEMO !== "true") {
    return null;
  }

  return (
    <div className="border-b border-rule bg-paper-warm/70">
      <div className="mx-auto flex max-w-[2520px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-10 xl:px-20">
        <div className="flex items-start gap-3">
          <TbArchive
            className="mt-0.5 shrink-0 text-lacquer"
            size={16}
            aria-hidden
          />
          <p className="font-mono text-[11px] uppercase tracking-archive text-ink-soft">
            Portfolio demo · checkout, messages, uploads &amp; account actions
            are{" "}
            <span className="editorial-italic text-[14px] not-italic tracking-normal text-lacquer">
              simulated
            </span>
            .
          </p>
        </div>
        <Link
          href="/how-it-works"
          className="group inline-flex items-center gap-2 self-start border-b border-ink/40 pb-0.5 font-mono text-[11px] uppercase tracking-archive text-ink hover:border-ink"
        >
          View product flow
          <TbExternalLink
            size={14}
            className="transition group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
