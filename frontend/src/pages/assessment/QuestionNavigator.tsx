import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubmissionQuestion } from "@/types/exam";

//This component is used in both QuizPage and ResultPage to show a summary of questions and allow quick navigation between them. 
//It has two modes: "quiz" mode for when the user is taking the quiz, and "result" mode for when they are reviewing their answers after submission.

type QuestionNavigatorProps =
  | {
      mode: "quiz";
      questions: SubmissionQuestion[];
      currentIndex: number;
      answers: Map<string, { submissionQuestionId: string; answerValue: string }>;
      markedForReview: Set<string>;
      onQuestionClick: (index: number) => void;
    }
  | {
      mode: "result";
      questions: SubmissionQuestion[];
      onQuestionClick: (questionId: string) => void;
    };

export function QuestionNavigator(props: QuestionNavigatorProps) {
  const { mode, questions } = props;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Question Navigator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            let bg = "";
            let title = "";

            if (mode === "quiz") {
              const { currentIndex, answers, markedForReview, onQuestionClick } = props;
              const hasAnswer = answers.has(q.id) && answers.get(q.id)!.answerValue !== "";
              const isCurrent = idx === currentIndex;
              const isMarked = markedForReview.has(q.id);

              bg = "bg-gray-100 text-gray-600 border-gray-200";
              if (hasAnswer) bg = "bg-green-100 text-green-700 border-green-300";
              if (isCurrent) bg += " ring-2 ring-blue-500";

              title = `Q${idx + 1} — ${hasAnswer ? "Answered" : "Unanswered"}${isMarked ? " (marked)" : ""}`;

              return (
                <button
                  key={q.id}
                  onClick={() => onQuestionClick(idx)}
                  className={`relative h-10 w-full rounded border text-sm font-medium transition-all ${bg}`}
                  title={title}
                >
                  {idx + 1}
                  {isMarked && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full border border-white" />
                  )}
                </button>
              );
            } else {
              const { onQuestionClick } = props;
              const isCorrect = q.isCorrect === true;
              const wasAnswered = !!q.userAnswer;

              bg = "bg-gray-100 text-gray-600 border-gray-200";
              if (isCorrect) bg = "bg-green-100 text-green-700 border-green-300";
              else if (wasAnswered) bg = "bg-red-100 text-red-700 border-red-300";

              title = `Q${idx + 1} — ${isCorrect ? "Correct" : wasAnswered ? "Incorrect" : "Unanswered"}`;

              return (
                <button
                  key={q.id}
                  onClick={() => onQuestionClick(q.id)}
                  className={`h-10 w-full rounded border text-sm font-medium transition-all hover:ring-2 hover:ring-blue-300 ${bg}`}
                  title={title}
                >
                  {idx + 1}
                </button>
              );
            }
          })}
        </div>

        {/* Legend */}
        <div className="space-y-1.5 pt-2 border-t">
          {mode === "quiz" ? (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-3 w-3 rounded bg-gray-200" /> Unanswered
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-3 w-3 rounded bg-green-200" /> Answered
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="relative h-3 w-3 rounded bg-gray-200">
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full" />
                </span>
                Marked for Review
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-3 w-3 rounded bg-green-200" /> Correct
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-3 w-3 rounded bg-red-200" /> Incorrect
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-3 w-3 rounded bg-gray-200" /> Unanswered
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        {mode === "quiz" ? (
          <QuizSummary
            questions={questions}
            answers={props.answers}
            markedForReview={props.markedForReview}
          />
        ) : (
          <ResultSummary questions={questions} />
        )}
      </CardContent>
    </Card>
  );
}

// Quiz mode summary
function QuizSummary({
  questions,
  answers,
  markedForReview,
}: {
  questions: SubmissionQuestion[];
  answers: Map<string, { submissionQuestionId: string; answerValue: string }>;
  markedForReview: Set<string>;
}) {
  const answeredCount = questions.filter(
    (q) => answers.has(q.id) && answers.get(q.id)!.answerValue !== ""
  ).length;

  return (
    <div className="p-3 rounded-lg bg-gray-50 text-xs space-y-1">
      <p>
        Answered: <strong>{answeredCount}</strong> / {questions.length}
      </p>
      <p>
        Marked: <strong>{markedForReview.size}</strong>
      </p>
      <p>
        Unanswered: <strong>{questions.length - answeredCount}</strong>
      </p>
    </div>
  );
}

// Result mode summary
function ResultSummary({ questions }: { questions: SubmissionQuestion[] }) {
  const correctCount = questions.filter((q) => q.isCorrect === true).length;
  const incorrectCount = questions.filter((q) => q.isCorrect === false).length;
  const unansweredCount = questions.filter((q) => q.isCorrect === null && !q.userAnswer).length;

  return (
    <div className="p-3 rounded-lg bg-gray-50 text-xs space-y-1">
      <p>
        Correct: <strong className="text-green-600">{correctCount}</strong> / {questions.length}
      </p>
      <p>
        Incorrect: <strong className="text-red-600">{incorrectCount}</strong>
      </p>
      <p>
        Unanswered: <strong className="text-gray-600">{unansweredCount}</strong>
      </p>
    </div>
  );
}
