import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import SamplingPamLabContainer from "@/components/labs/SamplingPamLabContainer";
import { LABS_CATALOG } from "@/lib/labs/catalog";

const lab = LABS_CATALOG.find((l) => l.id === "sampling-pam")!;

export const Route = createFileRoute("/labs/communication-systems/sampling-pam")({
  head: () => ({
    meta: [
      { title: `${lab.title} — Virtual Lab` },
      { name: "description", content: lab.shortObjective },
    ],
  }),
  component: SamplingPamLabPage,
});

function SamplingPamLabPage() {
  return (
    <ClientOnly fallback={<div className="h-screen w-full bg-canvas" />}>
      <SamplingPamLabContainer />
    </ClientOnly>
  );
}
