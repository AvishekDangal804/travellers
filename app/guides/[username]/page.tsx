import { redirect } from "next/navigation";

export default async function GuideRedirect({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  redirect(`/?view=guide&id=${username}`);
}
