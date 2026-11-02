export type RevalidationAdapter = {
  path: (path: string) => void;
  tag: (tag: string) => void;
};

export function revalidateNewsSurfaces(
  result: { persisted: number; purged: number },
  revalidate: RevalidationAdapter,
) {
  if (result.persisted === 0 && result.purged === 0) return false;

  revalidate.tag("news");
  revalidate.path("/");
  revalidate.path("/news");
  revalidate.path("/today");
  revalidate.path("/explore");
  return true;
}

export function revalidateCalendarSurfaces(revalidate: RevalidationAdapter) {
  revalidate.tag("jewish-today");
  revalidate.path("/");
  revalidate.path("/today");
}
