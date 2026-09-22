import type { Metadata } from "next";

import { YouTubeFacade } from "@/components/podcasts/youtube-facade";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { YOUTUBE_FACADE_FIXTURE } from "@/lib/podcasts/youtube";

export const metadata: Metadata = {
  title: "YouTube facade fixture",
  robots: { index: false, follow: false },
};

export default function YouTubeFacadeFixturePage() {
  return (
    <Section>
      <Container size="content">
        <p className="eyebrow">Development fixture</p>
        <h1 className="display-title">YouTube facade</h1>
        <p className="podcast-section-copy">{YOUTUBE_FACADE_FIXTURE.label}</p>
        <div className="podcast-media">
          <YouTubeFacade
            title="YouTube facade development fixture"
            videoId={YOUTUBE_FACADE_FIXTURE.id}
          />
        </div>
      </Container>
    </Section>
  );
}
