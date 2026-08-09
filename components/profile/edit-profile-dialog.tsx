"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Role } from "@/types/enums";

interface HikerDefaults {
  bio: string;
  location: string;
  interests: string[];
}

interface GuideDefaults {
  bio: string;
  location: string;
  pricePerDay: number;
  languages: string[];
  specialties: string[];
}

export function EditProfileDialog({
  role,
  hiker,
  guide,
}: {
  role: Role;
  hiker?: HikerDefaults;
  guide?: GuideDefaults;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bio, setBio] = useState(hiker?.bio ?? guide?.bio ?? "");
  const [location, setLocation] = useState(hiker?.location ?? guide?.location ?? "");
  const [interests, setInterests] = useState((hiker?.interests ?? []).join(", "));
  const [languages, setLanguages] = useState((guide?.languages ?? []).join(", "));
  const [specialties, setSpecialties] = useState((guide?.specialties ?? []).join(", "));
  const [pricePerDay, setPricePerDay] = useState(guide?.pricePerDay ?? 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const body =
      role === "GUIDE"
        ? {
            bio,
            location,
            pricePerDay,
            languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
            specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean),
          }
        : {
            bio,
            location,
            interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
          };

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Could not update your profile.");
        setSubmitting(false);
        return;
      }
      toast.success("Profile updated.");
      setSubmitting(false);
      setOpen(false);
      router.refresh();
    } catch {
      setSubmitting(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" /> Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          {role === "GUIDE" ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pricePerDay">Price per day (NPR)</Label>
                <Input
                  id="pricePerDay"
                  type="number"
                  min={0}
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="languages">Languages (comma-separated)</Label>
                <Input id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                <Input id="specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)} />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input id="interests" value={interests} onChange={(e) => setInterests(e.target.value)} />
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}