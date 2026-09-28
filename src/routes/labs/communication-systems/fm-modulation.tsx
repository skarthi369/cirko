import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import FmModulationLabContainer from "@/components/labs/FmModulationLabContainer";
import { LABS_CATALOG } from "@/lib/labs/catalog";

const lab = LABS_CATALOG.find((l) => l.id === "fm-modulation")!;

export const Route = createFileRoute("/labs/communication-systems/fm-modulation")({
  head: () => ({
    meta: [
      { title: `${lab.title} — Virtual Lab` },
      { name: "description", content: lab.shortObjective },
    ],
  }),
  component: FmModulationLabPage,
});

function FmModulationLabPage() {
  return (
    <ClientOnly fallback={<div className="h-screen w-full bg-canvas" />}>
      <FmModulationLabContainer />
    </ClientOnly>
  );
}
