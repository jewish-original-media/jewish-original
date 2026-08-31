import type { ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"article"> & {
  tone?: "paper" | "warm";
};

export function Card({ tone = "paper", className = "", ...props }: CardProps) {
  const toneClass = tone === "warm" ? "card--warm" : "";

  return (
    <article className={`card ${toneClass} ${className}`.trim()} {...props} />
  );
}
