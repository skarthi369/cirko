import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import FiberModulationLabContainer from "@/components/labs/FiberModulationLabContainer";
import { LABS_CATALOG } from "@/lib/labs/catalog";

const lab = LABS_CATALOG.find((l) => l.id === "laser-fiber-intensity-modulation")!;

export const Route = createFileRoute(
  "/labs/optical-communication/laser-fiber-intensity-modulation",
)({
  head: () => ({
    meta: [
      { title: `${lab.title} — Virtual Lab` },
      { name: "description", content: lab.shortObjective },
    ],
  }),
  component: LaserFiberIntensityModulationPage,
});

function LaserFiberIntensityModulationPage() {
  return (
    <ClientOnly fallback={<div className="h-screen w-full bg-canvas" />}>
      <FiberModulationLabContainer />
    </ClientOnly>
  );
}
