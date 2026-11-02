"use client";

import { useState } from "react";

type SourcePreviewImageProps = {
  className: string;
  fallbackClassName: string;
  src: string;
};

export function SourcePreviewImage({
  className,
  fallbackClassName,
  src,
}: SourcePreviewImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span aria-hidden="true" className={fallbackClassName} />;
  }

  return (
    // Source domains are dynamic and untrusted; bypassing the optimizer avoids
    // proxying arbitrary third-party URLs through the application.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      className={className}
      decoding="async"
      loading="lazy"
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
      src={src}
    />
  );
}
