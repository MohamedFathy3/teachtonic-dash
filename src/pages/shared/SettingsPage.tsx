import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon, Globe } from "lucide-react";

export function SettingsPage() {
  const { t, theme, toggleTheme, lang, setLang } = useApp();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={t("settings")} description="Manage your account and platform preferences" />

      <Card className="rounded-2xl border-border p-6 shadow-soft">
        <h3 className="font-semibold">Profile</h3>
        <Separator className="my-4" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("name")}</Label>
            <Input defaultValue="Ahmed Al-Mansouri" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>{t("email")}</Label>
            <Input defaultValue="ahmed@eduflow.app" className="rounded-xl" />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button className="rounded-xl gradient-primary border-0 shadow-glow">{t("save")}</Button>
        </div>
      </Card>

      <Card className="rounded-2xl border-border p-6 shadow-soft">
        <h3 className="font-semibold">{t("appearance")}</h3>
        <Separator className="my-4" />
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              {theme === "light" ? <Sun className="h-5 w-5 text-warning" /> : <Moon className="h-5 w-5 text-primary" />}
              <div>
                <p className="text-sm font-medium">{t("theme")}</p>
                <p className="text-xs text-muted-foreground">{theme === "light" ? t("light") : t("dark")}</p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium">{t("language")}</p>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "English" : "العربية"}</p>
              </div>
            </div>
            <div className="flex rounded-lg bg-background p-0.5 ring-1 ring-border">
              <button
                onClick={() => setLang("en")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-smooth ${lang === "en" ? "bg-primary text-primary-foreground" : ""}`}
              >EN</button>
              <button
                onClick={() => setLang("ar")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-smooth ${lang === "ar" ? "bg-primary text-primary-foreground" : ""}`}
              >AR</button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border-border p-6 shadow-soft">
        <h3 className="font-semibold">Notifications</h3>
        <Separator className="my-4" />
        {["Email notifications", "Push notifications", "Weekly digest", "Marketing updates"].map((label, i) => (
          <div key={label} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">Receive updates about platform activity</p>
            </div>
            <Switch defaultChecked={i < 2} />
          </div>
        ))}
      </Card>
    </div>
  );
}
