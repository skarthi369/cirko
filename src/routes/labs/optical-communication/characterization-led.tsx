import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import LedLabContainer from "@/components/labs/LedLabContainer";

export const Route = createFileRoute("/labs/optical-communication/characterization-led")({
  head: () => ({
    meta: [
      { title: "Characterization of LED — Virtual Lab" },
      {
        name: "description",
        content: "Study voltage-current (V-I) forward bias characteristics of an LED.",
      },
    ],
  }),
  component: CharacterizationLedPage,
});

function CharacterizationLedPage() {
  return (
    <ClientOnly fallback={<div className="h-screen w-full bg-canvas" />}>
      <LedLabContainer />
    </ClientOnly>
  );
}
