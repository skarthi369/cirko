import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type CompletionCertificateModalProps = {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  experimentTitle?: string;
  labTitle?: string;
  categoryTitle: string;
  score?: number;
  maxScore?: number;
  trialsRecorded?: number;
  observationsCount?: number;
  onClose: () => void;
  studentName?: string;
  date?: string;
  preTestScore?: number;
  postTestScore?: number;
};

export default function CompletionCertificateModal({
  open,
  isOpen,
  onOpenChange,
  experimentTitle,
  labTitle,
  categoryTitle,
  score,
  maxScore = 100,
  trialsRecorded,
  observationsCount,
  onClose,
  studentName: propStudentName,
  date: propDate,
  preTestScore,
  postTestScore,
}: CompletionCertificateModalProps) {
  const isModalOpen = open ?? isOpen ?? false;
  const handleOpenChange =
    onOpenChange ??
    ((v: boolean) => {
      if (!v) onClose();
    });
  const effectiveTitle = experimentTitle || labTitle || "Virtual Engineering Laboratory";
  const effectiveTrials = trialsRecorded ?? observationsCount ?? 0;
  const effectiveScore =
    score !== undefined
      ? score
      : postTestScore !== undefined && postTestScore > 0
        ? Math.min(100, Math.round(((postTestScore + (preTestScore ?? 1)) / 4) * 100))
        : 85;

  const [studentName, setStudentName] = useState(propStudentName || "Engineering Student");
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const dateStr =
    propDate ||
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const certId = `VLAB-${Math.abs(
    (effectiveTitle + studentName + dateStr).split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0),
  )
    .toString(16)
    .toUpperCase()
    .padStart(8, "0")}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
      bgGrad.addColorStop(0, "#090d16");
      bgGrad.addColorStop(0.5, "#0f172a");
      bgGrad.addColorStop(1, "#090d16");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 800);

      // 2. Outer Ornamental Border
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 1140, 740);

      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 40, 1120, 720);

      // Corner ornaments
      const drawCorner = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 25);
        ctx.lineTo(0, 0);
        ctx.lineTo(25, 0);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(48, 48, 0);
      drawCorner(1152, 48, Math.PI / 2);
      drawCorner(1152, 752, Math.PI);
      drawCorner(48, 752, -Math.PI / 2);

      // 3. Institution & Title Header
      ctx.textAlign = "center";
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillText("CIRKITLAB VIRTUAL ENGINEERING LABORATORY", 600, 95);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px 'Courier New', monospace";
      ctx.fillText("IIT Roorkee & IIT Virtual Labs Pedagogy Model", 600, 120);

      // 4. Main Certificate Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px Georgia, serif";
      ctx.fillText("Certificate of Practical Completion", 600, 175);

      // Subtitle
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "italic 16px Georgia, serif";
      ctx.fillText(
        "This official credential certifies verified execution of laboratory procedures, data acquisition,",
        600,
        215,
      );
      ctx.fillText("and theoretical analysis for the engineering practical:", 600, 240);

      // 5. Experiment Box
      ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(250, 265, 700, 65, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px 'Courier New', monospace";
      ctx.fillText(effectiveTitle, 600, 296);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px 'Courier New', monospace";
      ctx.fillText(categoryTitle.toUpperCase(), 600, 318);

      // 6. Conferred Upon
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px 'Courier New', monospace";
      ctx.fillText("CONFERRED UPON", 600, 365);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 34px Georgia, serif";
      ctx.fillText(studentName || "Engineering Student", 600, 410);

      // Underline
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(380, 425);
      ctx.lineTo(820, 425);
      ctx.stroke();

      // 7. Metrics Grid
      const colX = [300, 600, 900];
      const yMetric = 490;

      // Date
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px 'Courier New', monospace";
      ctx.fillText("DATE ISSUED", colX[0]!, yMetric);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillText(dateStr, colX[0]!, yMetric + 25);

      // Trials
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px 'Courier New', monospace";
      ctx.fillText("TRIALS LOGGED", colX[1]!, yMetric);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillText(`${effectiveTrials} Observations`, colX[1]!, yMetric + 25);

      // Score
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px 'Courier New', monospace";
      ctx.fillText("SCORE ACHIEVED", colX[2]!, yMetric);
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillText(`${effectiveScore} / ${maxScore} XP`, colX[2]!, yMetric + 25);

      // Divider line
      ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(150, 560);
      ctx.lineTo(1050, 560);
      ctx.stroke();

      // 8. Seal / Badge (Bottom Right)
      ctx.save();
      ctx.translate(980, 650);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
      ctx.fill();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 10px 'Courier New', monospace";
      ctx.fillText("★ VERIFIED ★", 0, -8);
      ctx.font = "bold 9px 'Courier New', monospace";
      ctx.fillText("VIRTUAL LAB", 0, 8);
      ctx.fillText("ENGINEERING", 0, 20);
      ctx.restore();

      // 9. Signatures and Verification Footer
      ctx.textAlign = "left";
      ctx.fillStyle = "#64748b";
      ctx.font = "11px 'Courier New', monospace";
      ctx.fillText(`Verification ID: ${certId}`, 150, 640);
      ctx.fillText("Simulation Engine: CirkitLab Deterministic MNA / DSP Runtime", 150, 660);
      ctx.fillText("Credential Authentication: Self-Contained Laboratory Signature", 150, 680);

      ctx.textAlign = "center";
      ctx.fillStyle = "#475569";
      ctx.font = "italic 11px Georgia, serif";
      ctx.fillText(
        "This digital credential confirms non-destructive virtual lab completion conforming to standard engineering curricula.",
        600,
        730,
      );

      // Trigger instant browser download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      const cleanFileName = `Certificate-${effectiveTitle.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      a.download = cleanFileName;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Failed to download certificate image:", e);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${effectiveTitle}</title>
  <style>
    @page { size: landscape; margin: 0; }
    body {
      margin: 0;
      padding: 40px;
      font-family: Georgia, serif;
      background: #090d16;
      color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .cert-container {
      width: 1050px;
      padding: 50px 60px;
      border: 4px double #38bdf8;
      background: linear-gradient(135deg, #090d16 0%, #0f172a 50%, #090d16 100%);
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      position: relative;
      box-sizing: border-box;
    }
    .sub-head {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      font-weight: bold;
      color: #38bdf8;
      letter-spacing: 2px;
      margin: 0;
    }
    .pedagogy {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #94a3b8;
      margin-top: 5px;
    }
    h1 {
      font-size: 36px;
      margin: 20px 0 10px 0;
      color: #f8fafc;
    }
    .intro {
      font-size: 15px;
      color: #cbd5e1;
      font-style: italic;
      margin: 0 auto;
      max-width: 750px;
      line-height: 1.5;
    }
    .exp-box {
      display: inline-block;
      margin: 25px auto;
      padding: 14px 40px;
      border: 1.5px solid rgba(56, 189, 248, 0.4);
      background: rgba(56, 189, 248, 0.08);
      border-radius: 8px;
    }
    .exp-title {
      font-family: 'Courier New', monospace;
      font-size: 20px;
      font-weight: bold;
      color: #ffffff;
      margin: 0;
    }
    .exp-cat {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #38bdf8;
      margin-top: 4px;
      text-transform: uppercase;
      font-weight: bold;
    }
    .recipient {
      font-size: 34px;
      font-weight: bold;
      color: #f8fafc;
      border-bottom: 2px solid #38bdf8;
      display: inline-block;
      padding: 0 40px 6px 40px;
      margin-top: 10px;
    }
    .metrics {
      display: flex;
      justify-content: space-around;
      margin-top: 40px;
      padding-top: 25px;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      font-family: 'Courier New', monospace;
    }
    .metric-val {
      font-size: 16px;
      font-weight: bold;
      color: #ffffff;
      margin-top: 5px;
    }
    .metric-val.score { color: #34d399; }
    .metric-val.trials { color: #38bdf8; }
    .metric-lbl {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
    }
    .footer {
      margin-top: 35px;
      font-size: 11px;
      color: #64748b;
      font-family: 'Courier New', monospace;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body { background: none; color: #000; padding: 0; }
      .cert-container { border-color: #0284c7; box-shadow: none; background: #fff; color: #000; }
      h1, .recipient, .exp-title, .metric-val { color: #000 !important; }
      .sub-head, .exp-cat, .metric-val.trials { color: #0284c7 !important; }
      .metric-val.score { color: #059669 !important; }
      .intro, .pedagogy, .metric-lbl, .footer { color: #475569 !important; }
    }
  </style>
</head>
<body>
  <div class="cert-container">
    <p class="sub-head">CIRKITLAB VIRTUAL ENGINEERING LABORATORY</p>
    <p class="pedagogy">IIT Roorkee & IIT Virtual Labs Pedagogy Model</p>
    <h1>Certificate of Practical Completion</h1>
    <p class="intro">
      This official credential certifies verified execution of laboratory procedures, data acquisition,
      and theoretical analysis for the engineering practical:
    </p>
    <div class="exp-box">
      <div class="exp-title">${effectiveTitle}</div>
      <div class="exp-cat">${categoryTitle}</div>
    </div>
    <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #94a3b8; text-transform: uppercase;">Conferred upon:</div>
    <div class="recipient">${studentName || "Engineering Student"}</div>
    <div class="metrics">
      <div>
        <div class="metric-lbl">Date Issued</div>
        <div class="metric-val">${dateStr}</div>
      </div>
      <div>
        <div class="metric-lbl">Trials Logged</div>
        <div class="metric-val trials">${effectiveTrials} Observations</div>
      </div>
      <div>
        <div class="metric-lbl">Score Achieved</div>
        <div class="metric-val score">${effectiveScore} / ${maxScore} XP</div>
      </div>
    </div>
    <div class="footer">
      <div>Verification ID: ${certId}</div>
      <div>Simulation: CirkitLab Deterministic Engine Verified</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `Certificate-${effectiveTitle.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center font-mono text-xl font-bold text-foreground">
            🎓 Virtual Lab Completion Certificate
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            Official completion record with direct download options (PNG Image, Standalone HTML, or
            Print PDF).
          </DialogDescription>
        </DialogHeader>

        {/* Certificate Border and Layout */}
        <div
          id="certificate-print-area"
          className="relative my-2 rounded-xl border-4 border-double border-primary/60 bg-gradient-to-br from-card via-sidebar to-card p-8 text-center shadow-lg"
        >
          {/* Watermark / Badge Accent */}
          <div className="absolute top-4 right-4 flex size-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-mono text-xs font-bold text-primary">
            ✓ 100%
          </div>

          <p className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            Virtual Engineering Laboratory
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            IIT Roorkee & IIT Virtual Labs Pedagogy Model
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Certificate of Practical Completion
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            This certificate is awarded in recognition of successful execution of experimental
            procedures, data collection, and physical analysis for:
          </p>

          <div className="my-5 inline-block rounded-lg border border-primary/30 bg-primary/5 px-6 py-2">
            <h3 className="font-mono text-base font-bold text-foreground">{effectiveTitle}</h3>
            <p className="text-xs text-primary font-mono">{categoryTitle}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Conferred upon:</p>
            <div className="mx-auto max-w-sm">
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="text-center font-serif text-xl font-bold text-foreground border-b-2 border-primary bg-transparent focus-visible:ring-0"
                placeholder="Enter Student Full Name"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs font-mono">
            <div>
              <p className="text-muted-foreground">Date Issued</p>
              <p className="font-bold text-foreground">{dateStr}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Trials Logged</p>
              <p className="font-bold text-primary">{effectiveTrials} Observations</p>
            </div>
            <div>
              <p className="text-muted-foreground">Performance Score</p>
              <p className="font-bold text-emerald-500">
                {effectiveScore} / {maxScore} XP
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span>ID: {certId}</span>
            <span>CirkitLab Virtual Learning Environment · Verified</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={onClose} className="font-mono text-xs">
            Close
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={handleDownloadPng}
              disabled={downloading}
              className="font-mono text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span>⬇️</span>
              <span>{downloading ? "Generating..." : "Download Certificate (PNG)"}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadHtml}
              className="font-mono text-xs gap-1.5"
            >
              <span>📄</span>
              <span>Download HTML</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrint}
              className="font-mono text-xs gap-1.5"
            >
              <span>🖨️</span>
              <span>Print / PDF</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
