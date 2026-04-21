import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Globe2, Eye, Image as ImageIcon, Layout, Check, ExternalLink, Sparkles } from "lucide-react";

const templates = [
  { id: "minimal", name: "Minimal", desc: "Clean, content-first design", accent: "from-slate-700 to-slate-900" },
  { id: "vibrant", name: "Vibrant", desc: "Bold colors and big imagery", accent: "from-fuchsia-500 to-violet-600" },
];

export function InstructorWebsite() {
  const { t } = useApp();
  const [enabled, setEnabled] = useState(true);
  const [template, setTemplate] = useState("vibrant");
  const [color, setColor] = useState("#6d3aff");

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={t("websiteBuilder")}
        description="Launch a public site for your courses in minutes"
        actions={
          <Button className="gap-2 rounded-xl gradient-primary border-0 shadow-glow">
            <Eye className="h-4 w-4" />{t("livePreview")}
          </Button>
        }
      />

      {/* Status */}
      <Card className="rounded-2xl border-border p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${enabled ? "gradient-accent shadow-glow" : "bg-muted"}`}>
              <Globe2 className={`h-6 w-6 ${enabled ? "text-white" : "text-muted-foreground"}`} />
            </div>
            <div>
              <h3 className="font-semibold">{t("websiteStatus")}</h3>
              <p className="text-sm text-muted-foreground">
                {enabled ? <>Live at <span className="font-mono text-foreground">ahmed.eduflow.app</span></> : "Your site is currently offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {enabled && (
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <ExternalLink className="h-3.5 w-3.5" />Visit
              </Button>
            )}
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Templates */}
        <Card className="lg:col-span-2 rounded-2xl border-border p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t("chooseTemplate")}</h3>
              <p className="text-sm text-muted-foreground">Pick a starting point. You can switch any time.</p>
            </div>
            <Layout className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {templates.map((tpl) => {
              const selected = template === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setTemplate(tpl.id)}
                  className={`group relative overflow-hidden rounded-2xl border-2 text-start transition-smooth ${
                    selected ? "border-primary shadow-glow" : "border-border hover:border-primary/50"
                  }`}
                >
                  {selected && (
                    <div className="absolute end-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`aspect-[4/3] bg-gradient-to-br ${tpl.accent} p-5 text-white`}>
                    {/* Mock layout */}
                    <div className="flex items-center justify-between">
                      <div className="h-2 w-16 rounded-full bg-white/40" />
                      <div className="flex gap-1.5">
                        <div className="h-1.5 w-6 rounded-full bg-white/30" />
                        <div className="h-1.5 w-6 rounded-full bg-white/30" />
                        <div className="h-1.5 w-6 rounded-full bg-white/30" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="h-3 w-3/4 rounded-full bg-white/70" />
                      <div className="mt-2 h-2 w-1/2 rounded-full bg-white/40" />
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="aspect-square rounded-lg bg-white/15 backdrop-blur" />
                      ))}
                    </div>
                  </div>
                  <div className="bg-card p-4">
                    <p className="font-semibold">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground">{tpl.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Customize */}
        <Card className="rounded-2xl border-border p-6 shadow-soft">
          <h3 className="font-semibold">{t("customize")}</h3>
          <Separator className="my-4" />
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>{t("logo")}</Label>
              <button className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-border p-4 text-start hover:border-primary/50 transition-smooth">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Upload logo</p>
                  <p className="text-xs text-muted-foreground">PNG, SVG · max 2MB</p>
                </div>
              </button>
            </div>

            <div className="space-y-2">
              <Label>{t("banner")}</Label>
              <button className="flex aspect-[3/1] w-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 hover:border-primary/50 transition-smooth">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-1 text-xs text-muted-foreground">Click to upload</p>
                </div>
              </button>
            </div>

            <div className="space-y-2">
              <Label>{t("primaryColor")}</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-12 w-12 cursor-pointer rounded-xl border border-border bg-transparent"
                />
                <Input value={color} onChange={(e) => setColor(e.target.value)} className="rounded-xl font-mono" />
              </div>
              <div className="flex gap-2 pt-1">
                {["#6d3aff", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#ec4899"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-card transition-smooth"
                    style={{ background: c, boxShadow: `0 0 0 2px ${c === color ? c : "transparent"}` }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>

            <Button className="w-full gap-2 rounded-xl gradient-primary border-0 shadow-glow">
              <Sparkles className="h-4 w-4" />{t("save")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
