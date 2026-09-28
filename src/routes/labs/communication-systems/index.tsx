import { createFileRoute } from "@tanstack/react-router";
import CategoryOverviewPage from "@/components/labs/CategoryOverviewPage";

export const Route = createFileRoute("/labs/communication-systems/")({
  head: () => ({
    meta: [
      { title: "Communication Systems Labs — CirkitLab" },
      {
        name: "description",
        content: "Experiment with analog amplitude, frequency, and pulse modulation schemes.",
      },
    ],
  }),
  component: CommunicationSystemsCategoryPage,
});

function CommunicationSystemsCategoryPage() {
  return <CategoryOverviewPage categoryId="communication-systems" />;
}
