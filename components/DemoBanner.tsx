import Link from "next/link";
import { TbArchive, TbExternalLink } from "react-icons/tb";

export default function DemoBanner() {
  if (process.env.NEXT_PUBLIC_RESOUND_DEMO !== "true") {
    return null;
  }

  return (
    <div className="border-b border-emerald-100 bg-emerald-50/90">
      <div className="mx-auto flex max-w-[2520px] flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-10 xl:px-20">
        <div className="flex items-start gap-3 text-sm text-emerald-950">
          <TbArchive className="mt-0.5 shrink-0 text-emerald-700" size={18} />
          <p>
            Portfolio demo. Resound is archived, so checkout, messages, uploads, and account actions are simulated.
          </p>
        </div>
        <Link
          href="/how-it-works"
          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
        >
          View product flow
          <TbExternalLink size={16} />
        </Link>
      </div>
    </div>
  );
}
