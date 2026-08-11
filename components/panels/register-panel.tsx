"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { openPanel, closePanel, type PanelState } from "@/lib/panel-nav";

export function RegisterPanel({ then }: { then?: PanelState }) {
  const router = useRouter();
  const pathname = usePathname();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterInput>,
    defaultValues: { role: "HIKER" },
  });

  async function onSubmit(data: RegisterInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();

      if (!res.ok) {
        toast.error(body.error ?? "Could not create your account.");
        setSubmitting(false);
        return;
      }

      const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      setSubmitting(false);

      if (result?.error) {
        toast.success("Account created — please sign in.");
        openPanel(router, { view: "login", then });
        return;
      }

      toast.success("Welcome to TrailLink Nepal!");
      if (then) {
        openPanel(router, then);
      } else {
        closePanel(router, pathname);
      }
      router.refresh();
    } catch {
      setSubmitting(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Create your account</DialogTitle>
        <DialogDescription>Join hikers and guides across Nepal.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" {...register("name")} />
          {errors.name && <p className="text-xs text-danger-500">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" autoComplete="username" placeholder="lowercase, numbers, underscores" {...register("username")} />
          {errors.username && <p className="text-xs text-danger-500">{errors.username.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-danger-500">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-xs text-danger-500">{errors.password.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>I want to join as</Label>
          <Select value={watch("role")} onValueChange={(v) => setValue("role", v as RegisterInput["role"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIKER">A hiker looking for trails &amp; guides</SelectItem>
              <SelectItem value="GUIDE">A local guide offering trips</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={submitting} className="mt-2">
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        Already have an account?{" "}
        <button type="button" onClick={() => openPanel(router, { view: "login", then })} className="font-medium text-forest-700 hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}
