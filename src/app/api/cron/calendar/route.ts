import { revalidatePath, revalidateTag } from "next/cache";

import { authorizeCronRequest } from "@/features/ingest/auth";
import { revalidateCalendarSurfaces } from "@/features/ingest/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = authorizeCronRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  revalidateCalendarSurfaces({
    path: revalidatePath,
    tag: (tag) => revalidateTag(tag, "max"),
  });

  return Response.json({
    ok: true,
    revalidated: ["jewish-today", "/", "/today"],
  });
}
