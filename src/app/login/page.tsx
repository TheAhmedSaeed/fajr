import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data";
import { getT } from "@/lib/locale";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const profile = await getProfile();
  const { next, error } = await searchParams;

  if (profile) redirect(next ?? "/dashboard");

  const { locale, t } = await getT();

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-2xl font-bold">{t.login.title}</h1>
      <p className="mt-2 text-sm text-muted">{t.login.subtitle}</p>
      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <LoginForm next={next ?? "/dashboard"} locale={locale} />
    </div>
  );
}
