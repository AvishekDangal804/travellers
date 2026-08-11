import { redirect } from "next/navigation";

export default function GuideDashboardRedirect() {
  redirect("/?view=guide-dashboard");
}
