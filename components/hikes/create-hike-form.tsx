"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createHikeSchema, type CreateHikeInput } from "@/lib/validation/hike";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DIFFICULTIES, DIFFICULTY_LABELS } from "@/types/enums";

export function CreateHikeForm({
  destinations,
  defaultDestinationId,
}: {
  destinations: { id: string; name: string; region: string }[];
  defaultDestinationId?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateHikeInput>({
    resolver: zodResolver(createHikeSchema) as Resolver<CreateHikeInput>,
    defaultValues: {
      destinationId: defaultDestinationId ?? "",
      difficulty: "MODERATE",
      durationHours: 6,
      maxParticipants: 8,
      price: 0,
      images: [],
      requirements: [],
      equipment: [],
      safetyNotes: "",
    },
  });

  async function onSubmit(data: CreateHikeInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/hikes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not create this hike.");
        setSubmitting(false);
        return;
      }
      toast.success("Hike created!");
      router.push(`/hikes/${body.id}`);
      router.refresh();
    } catch {
      setSubmitting(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label>Destination</Label>
        <Select value={watch("destinationId")} onValueChange={(v) => setValue("destinationId", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a destination" />
          </SelectTrigger>
          <SelectContent>
            {destinations.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name} ({d.region})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.destinationId && <p className="text-xs text-danger-500">{errors.destinationId.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="e.g. Sunrise hike to Kala Patthar" {...register("title")} />
        {errors.title && <p className="text-xs text-danger-500">{errors.title.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} placeholder="What should people expect?" {...register("description")} />
        {errors.description && <p className="text-xs text-danger-500">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-xs text-danger-500">{errors.date.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startTime">Start time</Label>
          <Input id="startTime" type="time" {...register("startTime")} />
          {errors.startTime && <p className="text-xs text-danger-500">{errors.startTime.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="meetingPoint">Meeting point</Label>
        <Input id="meetingPoint" placeholder="e.g. Sundarijal gate" {...register("meetingPoint")} />
        {errors.meetingPoint && <p className="text-xs text-danger-500">{errors.meetingPoint.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Difficulty</Label>
          <Select value={watch("difficulty")} onValueChange={(v) => setValue("difficulty", v as CreateHikeInput["difficulty"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>
                  {DIFFICULTY_LABELS[d]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="durationHours">Duration (hours)</Label>
          <Input id="durationHours" type="number" min={1} {...register("durationHours")} />
          {errors.durationHours && <p className="text-xs text-danger-500">{errors.durationHours.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxParticipants">Max participants</Label>
          <Input id="maxParticipants" type="number" min={1} {...register("maxParticipants")} />
          {errors.maxParticipants && <p className="text-xs text-danger-500">{errors.maxParticipants.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Price (NPR, 0 = free)</Label>
          <Input id="price" type="number" min={0} {...register("price")} />
          {errors.price && <p className="text-xs text-danger-500">{errors.price.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="requirements">Requirements (comma-separated)</Label>
        <Input
          id="requirements"
          placeholder="Reasonable fitness level, prior trail experience"
          onChange={(e) =>
            setValue(
              "requirements",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="equipment">What to bring (comma-separated)</Label>
        <Input
          id="equipment"
          placeholder="Sturdy shoes, rain jacket, water bottle"
          onChange={(e) =>
            setValue(
              "equipment",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="safetyNotes">Safety notes</Label>
        <Textarea id="safetyNotes" rows={3} placeholder="Anything participants should know" {...register("safetyNotes")} />
      </div>

      <Button type="submit" disabled={submitting} size="lg">
        {submitting ? "Creating…" : "Create hike"}
      </Button>
    </form>
  );
}