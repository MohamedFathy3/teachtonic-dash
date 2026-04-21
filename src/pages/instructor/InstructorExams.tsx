import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, ClipboardList } from "lucide-react";
import { useState } from "react";
import { examsData } from "@/lib/mockData";

interface Question { id: number; text: string; choices: string[]; correct: number }

export function InstructorExams() {
  const { t } = useApp();
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: "What does useState return?", choices: ["A value", "A tuple of state and setter", "A promise", "A ref"], correct: 1 },
    { id: 2, text: "Which hook handles side effects?", choices: ["useMemo", "useCallback", "useEffect", "useRef"], correct: 2 },
  ]);

  const addQuestion = () =>
    setQuestions([...questions, { id: Date.now(), text: "", choices: ["", "", "", ""], correct: 0 }]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("exams")} description="Build and manage assessments" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {examsData.map((e) => (
          <Card key={e.id} className="rounded-2xl border-border p-5 shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-semibold leading-snug">{e.title}</h4>
            <p className="text-xs text-muted-foreground">{e.course}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="font-bold text-base">{e.questions}</p>
                <p className="text-muted-foreground">questions</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="font-bold text-base text-accent">{e.avgScore}%</p>
                <p className="text-muted-foreground">avg score</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border shadow-soft">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h3 className="font-semibold">Question builder</h3>
            <p className="text-sm text-muted-foreground">Drag to reorder, edit inline.</p>
          </div>
          <Button onClick={addQuestion} className="gap-2 rounded-xl gradient-primary border-0 shadow-glow">
            <Plus className="h-4 w-4" />Add question
          </Button>
        </div>
        <div className="space-y-4 p-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <button className="mt-2 cursor-grab text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-5 w-5" />
                </button>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{idx + 1}</span>
                    <Input
                      value={q.text}
                      onChange={(e) => {
                        const next = [...questions]; next[idx].text = e.target.value; setQuestions(next);
                      }}
                      placeholder="Type your question..."
                      className="rounded-xl bg-background"
                    />
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setQuestions(questions.filter(x => x.id !== q.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.choices.map((c, ci) => (
                      <label key={ci} className={`flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer transition-smooth ${q.correct === ci ? "border-accent bg-accent/5" : "border-border bg-background"}`}>
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={q.correct === ci}
                          onChange={() => { const next = [...questions]; next[idx].correct = ci; setQuestions(next); }}
                          className="accent-current"
                        />
                        <Input
                          value={c}
                          onChange={(e) => {
                            const next = [...questions]; next[idx].choices[ci] = e.target.value; setQuestions(next);
                          }}
                          placeholder={`Choice ${ci + 1}`}
                          className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 shadow-none"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
