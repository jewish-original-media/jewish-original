import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Support Jewish Original",
  description:
    "Help Jewish Original preserve Jewish history, culture, education, connection, and identity.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <Section>
      <Container size="content">
        <p className="eyebrow">Support</p>
        <h1 className="display-title">Help keep this history in the world.</h1>
        <p className="editorial-lede">
          Jewish Original is being built as a durable home for Jewish history
          and identity. Dedication, sponsorship, and donation tools will open
          only when they can be offered with the same care as the archive.
        </p>
        <p className="text-charcoal mt-8 mb-0 font-serif text-lg leading-8">
          There is no payment form yet, and no invented campaign. When support
          is ready, it will remain clearly labeled and secondary to the
          editorial work.
        </p>
      </Container>
    </Section>
  );
}
