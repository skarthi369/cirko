import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import AmModulationLabContainer from "@/components/labs/AmModulationLabContainer";
import { LABS_CATALOG } from "@/lib/labs/catalog";

const lab = LABS_CATALOG.find((l) => l.id === "am-modulation")!;

export const Route = createFileRoute("/labs/communication-systems/am-modulation")({
  head: () => ({
    meta: [
      { title: `${lab.title} — Virtual Lab` },
      { name: "description", content: lab.shortObjective },
    ],
  }),
  component: AmModulationLabPage,
});

function AmModulationLabPage() {
  return (
    <ClientOnly fallback={<div className="h-screen w-full bg-canvas" />}>
      <AmModulationLabContainer />
    </ClientOnly>
  );
}
