import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { CreateHikeForm } from "@/components/hikes/create-hike-form";

export const metadata: Metadata = { title: "Host a hike" };

export default async function CreateHikePage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/hikes/create");

  const { destination } = await searchParams;
  const destinations = await prisma.destination.findMany({
    select: { id: true, name: true, region: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-forest-950">Host a hike</h1>
      <p className="mt-2 text-stone-600">Organize a group hike and find fellow trekkers to join you.</p>
      <div className="mt-8">
        <CreateHikeForm destinations={destinations} defaultDestinationId={destination} />
      </div>
    </div>
  );
}