import { ConceptSection } from "@/components/concept-section";
import { CultureSection } from "@/components/culture-section";
import { CadenceSection } from "@/components/cadence-section";
import { DiagnosticSection } from "@/components/diagnostic-section";
import { GoalsSection } from "@/components/goals-section";
import { AntipatternsSection } from "@/components/antipatterns-section";
import { Hero } from "@/components/hero";
import { MetricsSection } from "@/components/metrics-section";
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
        <GoalsSection />
        <CultureSection />
        <CadenceSection />
        <AntipatternsSection />
        <DiagnosticSection />
        <StartSection />
      </main>
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>ОС эффективности · playbook для российской ИТ-компании с мировой амбицией</p>
          <p>Метрики — приборы. Культура — ОС. Лидерство — исход клиента.</p>
        </div>
      </footer>
    </>
  );
}
