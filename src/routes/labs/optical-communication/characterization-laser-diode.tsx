import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import LaserLabContainer from "@/components/labs/LaserLabContainer";
import { LABS_CATALOG } from "@/lib/labs/catalog";

const lab = LABS_CATALOG.find((l) => l.id === "characterization-laser-diode")!;

export const Route = createFileRoute("/labs/optical-communication/characterization-laser-diode")({
  head: () => ({
    meta: [
      { title: `${lab.title} — Virtual Lab` },
      { name: "description", content: lab.shortObjective },
    ],
  }),
  component: CharacterizationLaserDiodePage,
});

function CharacterizationLaserDiodePage() {
  return (
    <ClientOnly fallback={<div className="h-screen w-full bg-canvas" />}>
      <LaserLabContainer />
    </ClientOnly>
  );
}
