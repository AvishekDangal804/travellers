"use client";

import { Suspense, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mountain } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "GUIDE" ? "GUIDE" : "HIKER";
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterInput>,
    defaultValues: { role: defaultRole },
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

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      setSubmitting(false);

      if (result?.error) {
        toast.success("Account created — please sign in.");
        router.push("/login");
        return;
      }

      toast.success("Welcome to TrailLink Nepal!");
      router.push("/");
      router.refresh();
    } catch {
      setSubmitting(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <Link href="/" className="mx-auto mb-6 flex items-center gap-2 font-display text-xl font-bold text-forest-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-700 text-stone-50">
          <Mountain className="h-5 w-5" />
        </span>
        TrailLink Nepal
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Join hikers and guides across Nepal.</CardDescription>
        </CardHeader>
        <CardContent>
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
            <Link href="/login" className="font-medium text-forest-700 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}