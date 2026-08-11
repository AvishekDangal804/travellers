import { redirect } from "next/navigation";

export default async function BookingRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/?view=booking&id=${id}`);
}
