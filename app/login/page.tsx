"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mountain } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
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
    router.push(callbackUrl);
    router.refresh();
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
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Welcome back to TrailLink Nepal.</CardDescription>
        </CardHeader>
        <CardContent>
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
            <Link href="/register" className="font-medium text-forest-700 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-4 rounded-lg bg-stone-100 px-3 py-2 text-center text-xs text-stone-500">
            Demo account: avi.gurung@example.com / Password123!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}