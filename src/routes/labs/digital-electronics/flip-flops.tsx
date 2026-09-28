import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import FlipFlopsLabContainer from "@/components/labs/FlipFlopsLabContainer";
import { LABS_CATALOG } from "@/lib/labs/catalog";

const lab = LABS_CATALOG.find((l) => l.id === "flip-flops")!;

export const Route = createFileRoute("/labs/digital-electronics/flip-flops")({
  head: () => ({
    meta: [
      { title: `${lab.title} — Virtual Lab` },
      { name: "description", content: lab.shortObjective },
    ],
  }),
  component: FlipFlopsLabPage,
});

function FlipFlopsLabPage() {
  return (
    <ClientOnly fallback={<div className="h-screen w-full bg-canvas" />}>
      <FlipFlopsLabContainer />
    </ClientOnly>
  );
}
