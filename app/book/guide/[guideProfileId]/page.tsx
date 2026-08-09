import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, formatCurrency } from "@/lib/utils";
import { BookGuideForm } from "@/components/bookings/book-guide-form";

export const metadata: Metadata = { title: "Book a guide" };

export default async function BookGuidePage({ params }: { params: Promise<{ guideProfileId: string }> }) {
  const { guideProfileId } = await params;

  const session = await getSession();
  if (!session?.user) redirect(`/login?callbackUrl=/book/guide/${guideProfileId}`);

  const guide = await prisma.guideProfile.findUnique({
    where: { id: guideProfileId },
    include: { user: { select: { name: true, username: true, image: true } } },
  });
  if (!guide || guide.verificationStatus !== "VERIFIED") notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-forest-950">Book {guide.user.name}</h1>
      <p className="mt-2 text-stone-600">Review the details below, then continue to a mock payment.</p>

      <Card className="mt-6">
        <CardContent className="flex items-center gap-3 pt-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={guide.user.image ?? undefined} alt={guide.user.name} />
            <AvatarFallback>{initials(guide.user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-forest-950">{guide.user.name}</p>
            <p className="text-sm text-stone-500">{formatCurrency(guide.pricePerDay)} / day</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <BookGuideForm guideProfileId={guide.id} pricePerDay={guide.pricePerDay} />
      </div>
    </div>
  );
}