import type { ComponentPropsWithoutRef } from "react";

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  spacing?: "default" | "compact";
};

export function Section({
  spacing = "default",
  className = "",
  ...props
}: SectionProps) {
  const spacingClass = spacing === "compact" ? "section--compact" : "";

  return (
    <section
      className={`section ${spacingClass} ${className}`.trim()}
      {...props}
    />
  );
}
