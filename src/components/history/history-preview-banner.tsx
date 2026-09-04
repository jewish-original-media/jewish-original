import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

async function disableHistoryPreview() {
  "use server";

  const draft = await draftMode();
  draft.disable();
  redirect("/history");
}

export function HistoryPreviewBanner({
  workflowStatus,
}: {
  workflowStatus?: string;
}) {
  return (
    <aside className="bg-olive text-white" aria-label="Draft preview">
      <div className="site-container flex flex-col gap-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0">
          <strong>Private editorial preview.</strong>{" "}
          {workflowStatus
            ? `Workflow: ${workflowStatus}.`
            : "Only designated public-experience candidates are visible."}{" "}
          This content is not published.
        </p>
        <form action={disableHistoryPreview}>
          <button
            className="hover:text-olive min-h-10 border border-white/55 px-4 text-xs font-bold tracking-[0.12em] uppercase transition-colors hover:bg-white"
            type="submit"
          >
            Exit preview
          </button>
        </form>
      </div>
    </aside>
  );
}
