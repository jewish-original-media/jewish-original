"use client";

import { useState } from "react";

type CopyAddressProps = {
  address: string;
  className?: string;
  statusClassName?: string;
  valueClassName?: string;
};

export function CopyAddress({
  address,
  className,
  statusClassName,
  valueClassName,
}: CopyAddressProps) {
  const [status, setStatus] = useState("");

  return (
    <div className={className}>
      <a className={valueClassName} href={`mailto:${address}`}>
        {address}
      </a>
      <button
        className="button button--secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(address);
            setStatus("Address copied");
          } catch {
            setStatus("Select the address to copy it.");
          }
        }}
        type="button"
      >
        Copy address
      </button>
      <p aria-live="polite" className={statusClassName} role="status">
        {status}
      </p>
    </div>
  );
}
