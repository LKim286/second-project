import { ConceptSection } from "@/components/concept-section";
import { CultureSection } from "@/components/culture-section";
import { CadenceSection } from "@/components/cadence-section";
import { DiagnosticSection } from "@/components/diagnostic-section";
import { GoalsSection } from "@/components/goals-section";
import { AntipatternsSection } from "@/components/antipatterns-section";
import { Hero } from "@/components/hero";
import { MetricsSection } from "@/components/metrics-section";
import { OwnersSection } from "@/components/owners-section";
import { RewardsSection } from "@/components/rewards-section";
import { SiteHeader } from "@/components/site-header";
import { StartSection } from "@/components/start-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ConceptSection />
        <MetricsSection />
        <OwnersSection />
        <GoalsSection />
        <RewardsSection />
        <CultureSection />
        <CadenceSection />
        <AntipatternsSection />
        <DiagnosticSection />
        <StartSection />
      </main>
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>ОС эффективности · внутреннее ИТ ритейла, компания ~6500</p>
          <p>Метрики — приборы. Премия — за кассу и пик. Паритет — практики, не выручка.</p>
        </div>
      </footer>
    </>
  );
}
