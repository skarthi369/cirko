import { createFileRoute } from "@tanstack/react-router";
import CategoryOverviewPage from "@/components/labs/CategoryOverviewPage";

export const Route = createFileRoute("/labs/digital-electronics/")({
  head: () => ({
    meta: [
      { title: "Digital Electronics Labs — CirkitLab" },
      {
        name: "description",
        content: "Construct logic circuits, binary adders, latches, and sequential flip-flops.",
      },
    ],
  }),
  component: DigitalElectronicsCategoryPage,
});

function DigitalElectronicsCategoryPage() {
  return <CategoryOverviewPage categoryId="digital-electronics" />;
}
