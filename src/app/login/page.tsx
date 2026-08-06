import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const profile = await getProfile();
  const { next } = await searchParams;

  if (profile) redirect(next ?? "/dashboard");

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        No password. We email you a link that signs you in.
      </p>
      <LoginForm next={next ?? "/dashboard"} />
    </div>
  );
}
