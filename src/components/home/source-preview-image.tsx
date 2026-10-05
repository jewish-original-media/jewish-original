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
