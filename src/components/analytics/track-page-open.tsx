"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

export function TrackPageOpen({ event }: { event: string }) {
  useEffect(() => {
    track(event);
  }, [event]);

  return null;
}
