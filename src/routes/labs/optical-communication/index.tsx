import { createFileRoute } from "@tanstack/react-router";
import CategoryOverviewPage from "@/components/labs/CategoryOverviewPage";

export const Route = createFileRoute("/labs/optical-communication/")({
  head: () => ({
    meta: [
      { title: "Optical Communication Labs — CirkitLab" },
      {
        name: "description",
        content:
          "Explore optoelectronic components, semiconductor lasers, photodetectors, and fiber optics.",
      },
    ],
  }),
  component: OpticalCommunicationCategoryPage,
});

function OpticalCommunicationCategoryPage() {
  return <CategoryOverviewPage categoryId="optical-communication" />;
}
