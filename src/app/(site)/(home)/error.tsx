"use client";

import { Container } from "@/components/ui/container";

type HomeErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function HomeError({ retry }: HomeErrorProps) {
  return (
    <section>
      <Container size="content">
        <p className="eyebrow">Homepage</p>
        <h1 className="display-title">This page could not be assembled.</h1>
        <p className="editorial-lede">
          The daily modules are still available from their own routes when the
          homepage cannot load.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            className="button button--primary"
            onClick={() => retry()}
            type="button"
          >
            Try again
          </button>
          <a className="button button--secondary" href="/today">
            Open Jewish Today
          </a>
        </div>
      </Container>
    </section>
  );
}
