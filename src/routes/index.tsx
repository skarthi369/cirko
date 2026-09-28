import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import Editor from "@/components/circuit/Editor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CirkitLab — Online Circuit Designer" },
      {
        name: "description",
        content:
          "Design electronic circuits in your browser: drag in batteries, LEDs, sensors and an Arduino Uno, wire pins together, and save your work automatically.",
      },
      { property: "og:title", content: "CirkitLab — Online Circuit Designer" },
      {
        property: "og:description",
        content: "Drag-and-drop breadboard-style circuit editor with parts, wiring, and autosave.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="h-screen w-full bg-canvas" />}>
      <Editor />
    </ClientOnly>
  );
}
