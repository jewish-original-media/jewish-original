import Image from "next/image";
import Link from "next/link";

import styles from "./brand-logo.module.css";

type BrandLogoProps = {
  priority?: boolean;
};

export function BrandLogo({ priority = false }: BrandLogoProps) {
  return (
    <Link
      aria-label="Jewish Original Media — home"
      className={styles.plaque}
      data-brand-plaque="true"
      href="/"
    >
      <Image
        alt="Jewish Original Media"
        className={styles.mark}
        height={831}
        priority={priority}
        sizes="88px"
        src="/brand/jom-primary-white-gold.jpg"
        width={1024}
      />
    </Link>
  );
}
