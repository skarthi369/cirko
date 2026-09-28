import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import LogicGatesLabContainer from "@/components/labs/LogicGatesLabContainer";
import { LABS_CATALOG } from "@/lib/labs/catalog";

const lab = LABS_CATALOG.find((l) => l.id === "logic-gates")!;

export const Route = createFileRoute("/labs/digital-electronics/logic-gates")({
  head: () => ({
    meta: [
      { title: `${lab.title} — Virtual Lab` },
      { name: "description", content: lab.shortObjective },
    ],
  }),
  component: LogicGatesLabPage,
});

function LogicGatesLabPage() {
  return (
    <ClientOnly fallback={<div className="h-screen w-full bg-canvas" />}>
      <LogicGatesLabContainer />
    </ClientOnly>
  );
}
