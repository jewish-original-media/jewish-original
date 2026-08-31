import type { ComponentPropsWithoutRef } from "react";

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  size?: "site" | "content";
};

export function Container({
  size = "site",
  className = "",
  ...props
}: ContainerProps) {
  const sizeClass = size === "content" ? "content-container" : "site-container";

  return <div className={`${sizeClass} ${className}`.trim()} {...props} />;
}
