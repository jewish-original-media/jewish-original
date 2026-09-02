import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export default function HomePage() {
  return (
    <>
      <Section className="bg-sand/38 relative overflow-hidden">
        <div
          className="bg-gold/55 pointer-events-none absolute top-0 right-0 h-full w-px sm:right-[12%]"
          aria-hidden="true"
        />
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-end">
            <div>
              <p className="eyebrow">Jewish Original Media</p>
              <h1 className="display-title">
                A modern home for Jewish history, culture, education,
                connection, and identity.
              </h1>
              <p className="editorial-lede">
                Built to deepen Jewish knowledge and turn trusted stories into a
                meaningful daily practice.
              </p>
            </div>

            <div className="border-gold border-l-2 pl-6 sm:pl-8">
              <p className="text-navy m-0 text-sm font-semibold tracking-[0.12em] uppercase">
                History is the foundation.
              </p>
              <p className="text-charcoal mt-4 mb-0 font-serif text-lg leading-8">
                The first editorial collection and daily Jewish experience are
                being prepared from Jewish Original’s existing archive.
              </p>
              <ButtonLink
                className="mt-7"
                href="#principle"
                variant="secondary"
              >
                Our product principle
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="principle" spacing="compact">
        <Container>
          <Card
            tone="warm"
            className="grid gap-8 md:grid-cols-4 md:gap-0 md:p-0"
          >
            {[
              ["History", "The foundation"],
              ["Education", "Transmits it"],
              ["Identity", "The product"],
              ["Connection", "The outcome"],
            ].map(([title, description], index) => (
              <div
                className="md:border-gold/25 md:border-r md:p-8 md:last:border-r-0"
                key={title}
              >
                <p className="text-navy m-0 text-xs font-bold tracking-[0.14em] uppercase">
                  0{index + 1}
                </p>
                <h2 className="mt-5 mb-1 text-xl font-medium">{title}</h2>
                <p className="text-muted m-0 font-serif text-sm">
                  {description}
                </p>
              </div>
            ))}
          </Card>
        </Container>
      </Section>
    </>
  );
}
