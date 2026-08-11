import { redirect } from "next/navigation";

export default async function DestinationRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/?view=destination&id=${slug}`);
}
