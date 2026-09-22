"use client";

import { track } from "@vercel/analytics";
import type { ComponentPropsWithoutRef, MouseEvent } from "react";

type TrackedAnchorProps = ComponentPropsWithoutRef<"a"> & {
  event: string;
};

export function TrackedAnchor({
  event,
  onClick,
  ...props
}: TrackedAnchorProps) {
  function handleClick(click: MouseEvent<HTMLAnchorElement>) {
    track(event);
    onClick?.(click);
  }

  return <a {...props} onClick={handleClick} />;
}
