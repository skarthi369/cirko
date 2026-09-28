import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import AdderLabContainer from "@/components/labs/AdderLabContainer";
import { LABS_CATALOG } from "@/lib/labs/catalog";

const lab = LABS_CATALOG.find((l) => l.id === "half-full-adder")!;

export const Route = createFileRoute("/labs/digital-electronics/half-full-adder")({
  head: () => ({
    meta: [
      { title: `${lab.title} — Virtual Lab` },
      { name: "description", content: lab.shortObjective },
    ],
  }),
  component: HalfFullAdderLabPage,
});

function HalfFullAdderLabPage() {
  return (
    <ClientOnly fallback={<div className="h-screen w-full bg-canvas" />}>
      <AdderLabContainer />
    </ClientOnly>
  );
}
