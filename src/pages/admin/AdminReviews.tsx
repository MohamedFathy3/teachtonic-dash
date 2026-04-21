import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { reviewsData } from "@/lib/mockData";
import { Star } from "lucide-react";

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < value ? "fill-warning text-warning" : "text-muted"}`} />
      ))}
    </div>
  );
}

export function AdminReviews() {
  const { t } = useApp();
  const avg = (reviewsData.reduce((s, r) => s + r.rating, 0) / reviewsData.length).toFixed(1);
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("reviews")} description={`${reviewsData.length} reviews — average ${avg} ★`} />

      <div className="space-y-4">
        {reviewsData.map((r) => (
          <Card key={r.id} className="rounded-2xl border-border p-5 shadow-soft">
            <div className="flex items-start gap-4">
              <AvatarBadge initials={r.avatar} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{r.student}</p>
                    <p className="text-xs text-muted-foreground">on {r.course}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stars value={r.rating} />
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">"{r.comment}"</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
