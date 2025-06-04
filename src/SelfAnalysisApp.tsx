import { useState } from "react";
import { useRouter } from "next/router";

import { QUESTIONS, ANSWER_VALUES, CATEGORY_MAP } from "./questionData"; // ←設問とマッピングを分離してるならここで管理
// もし設問がこのファイルに含まれてるならそのままでOK

interface Answers {
  [key: string]: string;
}

export default function SelfAnalysisApp() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const question = QUESTIONS[current];

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    setCurrent((prev) => prev + 1);
  };

  const calcScores = () => {
    const score: Record<string, number> = {};
    for (const [category, ids] of Object.entries(CATEGORY_MAP)) {
      const raw = ids.map((id) => ANSWER_VALUES[answers[id]] || 0);
      const sum = raw.reduce((a, b) => a + b, 0);
      score[category] = Math.round(((sum + 10) / 20) * 10); // [-10〜+10]→[0〜10]
    }
    return score;
  };

  const handleSubmit = async () => {
    const scoreData = calcScores();
    const fullAnswers = Object.values(answers).map((v) => ANSWER_VALUES[v] || 0);

    // 回答データを保存 → resultIdを受け取る
    const res = await fetch("/api/saveAnswer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: fullAnswers }),
    });
    const { resultId } = await res.json();

    // Discord通知
    await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resultId }),
    });

    // 結果ページへ遷移
    router.push(`/result/${resultId}`);
  };

  // 全問終了後の送信画面
  if (current >= QUESTIONS.length) {
    return (
      <div className="text-center mt-12">
        <h2 className="text-xl font-bold mb-4">全ての質問に答えました！</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSubmit}
        >
          診断を送信する
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">自己分析診断（{current + 1} / {QUESTIONS.length}）</h1>
      <p className="mb-6">{question.text}</p>

      {question.type === "radio" && (
        <div className="space-y-2">
          {question.options.map((opt: string) => (
            <button
              key={opt}
              className="block w-full border rounded px-4 py-2 hover:bg-gray-100"
              onClick={() => handleAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === "text" && (
        <input
          type="text"
          className="border p-2 w-full mt-4"
          placeholder="自由記述"
          onBlur={(e) => handleAnswer(e.target.value)}
        />
      )}

      <p className="mt-6 text-sm text-gray-600">
        残り{QUESTIONS.length - current - 1}問
      </p>
    </div>
  );
}
