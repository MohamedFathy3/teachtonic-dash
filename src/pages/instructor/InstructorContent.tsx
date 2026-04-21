import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Film, X, CheckCircle2 } from "lucide-react";
import { useState, DragEvent } from "react";
import { Progress } from "@/components/ui/progress";

interface UploadedFile { id: number; name: string; size: string; type: "pdf" | "video"; progress: number }

export function InstructorContent() {
  const { t } = useApp();
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: 1, name: "Module-1-Introduction.pdf", size: "2.4 MB", type: "pdf", progress: 100 },
    { id: 2, name: "Lecture-React-Patterns.mp4", size: "184 MB", type: "video", progress: 65 },
  ]);

  const onDrop = (e: DragEvent) => {
    e.preventDefault(); setDragging(false);
    const list = Array.from(e.dataTransfer.files).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      type: (f.type.startsWith("video") ? "video" : "pdf") as "pdf" | "video",
      progress: 0,
    }));
    setFiles((p) => [...list, ...p]);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("content")} description="Upload lectures, PDFs, and videos for your courses" />

      <Card
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-3xl border-2 border-dashed p-12 text-center transition-smooth shadow-soft ${
          dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-card"
        }`}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
          <UploadCloud className="h-8 w-8 text-white" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{t("dragDrop")}</h3>
        <p className="text-sm text-muted-foreground">{t("orBrowse")}</p>
        <p className="mt-2 text-xs text-muted-foreground">{t("supportedFormats")}</p>
        <Button className="mt-5 rounded-xl gradient-primary border-0 shadow-glow">{t("upload")} files</Button>
      </Card>

      <Card className="rounded-2xl border-border p-6 shadow-soft">
        <h3 className="font-semibold">Recent uploads</h3>
        <ul className="mt-4 space-y-3">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-4 rounded-2xl border border-border p-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.type === "video" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                {f.type === "video" ? <Film className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <span className="text-xs text-muted-foreground ms-2">{f.size}</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={f.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground w-12 text-end">
                    {f.progress === 100 ? <CheckCircle2 className="h-4 w-4 text-accent inline" /> : `${f.progress}%`}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFiles(files.filter(x => x.id !== f.id))}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
