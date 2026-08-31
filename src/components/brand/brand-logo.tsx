import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  priority?: boolean;
  placement?: "header" | "footer";
};

export function BrandLogo({
  priority = false,
  placement = "header",
}: BrandLogoProps) {
  const sizeClass =
    placement === "header"
      ? "w-[4.75rem] sm:w-[5.5rem]"
      : "w-[12rem] sm:w-[14rem]";

  return (
    <Link
      className="inline-flex shrink-0"
      href="/"
      aria-label="Jewish Original Media — home"
    >
      <Image
        className={`h-auto ${sizeClass}`}
        src="/brand/jom-primary-white-gold.jpg"
        width={1024}
        height={831}
        alt="Jewish Original Media"
        priority={priority}
        sizes={placement === "header" ? "88px" : "224px"}
      />
    </Link>
  );
}
