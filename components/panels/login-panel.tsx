"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { openPanel, closePanel, type PanelState } from "@/lib/panel-nav";

export function LoginPanel({ then }: { then?: PanelState }) {
  const router = useRouter();
  const pathname = usePathname();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setSubmitting(true);
    const result = await signIn("credentials", { ...data, redirect: false });
    setSubmitting(false);

    if (result?.error) {
      toast.error(result.error === "CredentialsSignin" ? "Invalid email or password." : result.error);
      return;
    }
    toast.success("Welcome back!");
    if (then) {
      openPanel(router, then);
    } else {
      closePanel(router, pathname);
    }
    router.refresh();
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Sign in</DialogTitle>
        <DialogDescription>Welcome back to TrailLink Nepal.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-danger-500">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
          {errors.password && <p className="text-xs text-danger-500">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={submitting} className="mt-2">
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        New to TrailLink?{" "}
        <button type="button" onClick={() => openPanel(router, { view: "register", then })} className="font-medium text-forest-700 hover:underline">
          Create an account
        </button>
      </p>
      <p className="mt-4 rounded-lg bg-stone-100 px-3 py-2 text-center text-xs text-stone-500">
        Demo account: avi.gurung@example.com / Password123!
      </p>
    </div>
  );
}
