import { redirect } from "next/navigation";

export default async function BookGuideRedirect({ params }: { params: Promise<{ guideProfileId: string }> }) {
  const { guideProfileId } = await params;
  redirect(`/?view=book-guide&id=${guideProfileId}`);
}
