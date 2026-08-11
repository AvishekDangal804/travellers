import { redirect } from "next/navigation";

export default function CreateHikeRedirect() {
  redirect("/?view=create-hike");
}
