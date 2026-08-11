import { redirect } from "next/navigation";

export default async function HikeRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/?view=hike&id=${id}`);
}
