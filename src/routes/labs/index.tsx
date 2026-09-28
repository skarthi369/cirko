import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/labs/")({
  head: () => ({
    meta: [
      { title: "Virtual Labs — CirkitLab" },
      { name: "description", content: "Interactive electrical engineering virtual experiments." },
    ],
  }),
  component: LabsIndexPage,
});

const LAB_CATEGORIES = [
  {
    id: "optical",
    title: "Optical Communication Labs",
    description: "Explore optoelectronic components, semiconductor lasers, photodetectors, and fiber optics.",
    labs: [
      {
        id: "characterization-led",
        title: "1. Characterization of LED",
        description: "Study voltage-current (V-I) forward bias characteristics, knee voltage, and dynamic resistance.",
        path: "/labs/optical-communication/characterization-led",
        status: "available",
      },
      {
        id: "characterization-laser",
        title: "2. Characterization of LASER Diode",
        description: "Analyze threshold current, L-I characteristics, and optical output power of a semiconductor laser.",
        path: "#",
        status: "coming_soon",
      },
      {
        id: "intensity-modulation",
        title: "3. Intensity Modulation of LASER Output",
        description: "Investigate analog/digital signal transmission over fiber optic links.",
        path: "#",
        status: "coming_soon",
      },
    ],
  },
  {
    id: "digital",
    title: "Digital Electronics Labs",
    description: "Build logic circuits, binary adders, latches, and sequential flip-flops.",
    labs: [
      {
        id: "logic-gates",
        title: "1. Logic Gates Verification",
        description: "Construct truth tables for AND, OR, NOT, NAND, NOR, and XOR gates.",
        path: "#",
        status: "coming_soon",
      },
      {
        id: "adders",
        title: "2. Half & Full Adder",
        description: "Implement binary arithmetic circuits with Sum and Carry outputs.",
        path: "#",
        status: "coming_soon",
      },
      {
        id: "flip-flops",
        title: "3. Flip-Flop Circuits",
        description: "Analyze SR, JK, D, and T flip-flop state transitions.",
        path: "#",
        status: "coming_soon",
      },
    ],
  },
  {
    id: "comm",
    title: "Communication Systems Labs",
    description: "Experiment with analog amplitude, frequency, and pulse modulation schemes.",
    labs: [
      {
        id: "am-modulation",
        title: "1. AM Modulation & Demodulation",
        description: "Generate and envelope detect amplitude modulated signals.",
        path: "#",
        status: "coming_soon",
      },
      {
        id: "fm-modulation",
        title: "2. FM Modulation",
        description: "Study frequency deviation and carrier modulation index.",
        path: "#",
        status: "coming_soon",
      },
      {
        id: "pam-sampling",
        title: "3. Pulse Amplitude Modulation (PAM)",
        description: "Demonstrate Nyquist sampling and signal reconstruction.",
        path: "#",
        status: "coming_soon",
      },
    ],
  },
];

function LabsIndexPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-sidebar px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded bg-primary font-mono text-sm font-bold text-primary-foreground">
              C
            </span>
            <span className="font-mono text-sm font-bold">CirkitLab</span>
          </Link>
          <span className="text-border">|</span>
          <h1 className="font-mono text-sm font-semibold">Virtual Engineering Labs</h1>
        </div>

        <Link to="/">
          <Button variant="outline" size="sm" className="font-mono text-xs">
            ← Open Circuit Editor
          </Button>
        </Link>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-6xl flex-1 p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Virtual Engineering Laboratories</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select an interactive experiment to begin guided simulation, data collection, and physical analysis.
          </p>
        </div>

        <div className="space-y-8">
          {LAB_CATEGORIES.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="border-b border-border pb-2">
                <h3 className="text-lg font-bold font-mono text-primary">{cat.title}</h3>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {cat.labs.map((lab) => (
                  <Card key={lab.id} className="flex flex-col justify-between transition-colors hover:border-primary/50">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-semibold">{lab.title}</CardTitle>
                        {lab.status === "available" ? (
                          <Badge className="bg-emerald-600 text-[10px]">Available</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1 text-xs">{lab.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      {lab.status === "available" ? (
                        <Link to={lab.path}>
                          <Button size="sm" className="w-full font-mono text-xs">
                            Start Lab →
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="secondary" disabled className="w-full font-mono text-xs">
                          In Development
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
