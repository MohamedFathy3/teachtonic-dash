import { CheckCircle2, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Props {
  subjectId: number;
  active: boolean;
  onToggle: (id: number, value: boolean) => void;
  lang?: "ar" | "en";
}

export function SubjectStatusToggle({
  subjectId,
  active,
  onToggle,
  lang = "en",
}: Props) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Switch
        checked={active}
        onCheckedChange={(checked) =>
          onToggle(subjectId, checked)
        }
      />

      <div
        className={`
          flex items-center gap-2
          px-3 py-1.5
          rounded-full
          text-xs font-semibold
          border
          transition-all duration-300
          shadow-sm
          ${active
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-700 border-red-200"
          }
        `}
      >
        {active ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <XCircle className="h-3.5 w-3.5" />
        )}

        <span>
          {active
            ? lang === "ar"
              ? "نشط"
              : "Active"
            : lang === "ar"
              ? "غير نشط"
              : "Inactive"}
        </span>
      </div>
    </div>
  );
}