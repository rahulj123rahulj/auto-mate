import { requireAuth } from "@/lib/auth-utils";
export default async function Page() {
  await requireAuth();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
    </div>
  );
}
