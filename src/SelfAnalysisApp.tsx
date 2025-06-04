import { useState } from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';

const QUESTIONS = [
  {
    id: 1,
    text: '現在何回生ですか？',
    type: 'radio',
    options: ['1回生', '2回生', '3回生', '4回生', 'その他'],
    key: 'grade'
  },
  {
    id: 2,
    text: '学部は何ですか？',
    type: 'text',
    key: 'faculty'
  },
  // Q3以降に40問の設問を追加（後ほど省略せずに生成）
];

const ANSWER_VALUES = {
  'あてはまる': 2,
  'どちらかといえばあてはまる': 1,
  'どちらでもない': 0,
  'どちらかといえばあてはまらない': -1,
  'あてはまらない': -2,
};

const CATEGORY_MAP = {
  talk: [1, 2, 3, 4, 5],
  focus: [6, 7, 8, 9, 10],
  idea: [11, 12, 13, 14, 15],
  organize: [16, 17, 18, 19, 20],
  flexible: [21, 22, 23, 24, 25],
  emotion: [26, 27, 28, 29, 30],
  decision: [31, 32, 33, 34, 35],
  output: [36, 37, 38, 39, 40],
};

export default function SelfAnalysisApp() {
  const router = useRouter();
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);

  const handleAnswer = (value: string) => {
    const question = QUESTIONS[currentQ];
    setAnswers({ ...answers, [question.key || question.id]: value });
    setCurrentQ((prev) => prev + 1);
  };

  const calcScores = () => {
    const scores: Record<string, number> = {};
    for (const [category, qnums] of Object.entries(CATEGORY_MAP)) {
      const rawSum = qnums.reduce((sum, qid) => sum + (ANSWER_VALUES[answers[qid]] || 0), 0);
      scores[category] = Math.round(((rawSum + 10) / 20) * 10 * 10) / 10;
    }
    return scores;
  };

  const handleSubmit = async () => {
    const scores = calcScores();
    const docRef = await addDoc(collection(db, 'results'), {
      grade: answers.grade,
      faculty: answers.faculty,
      scores,
      timestamp: new Date(),
    });

    await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId: docRef.id })
    });

    router.push(`/result/${docRef.id}`);
  };

  const currentQuestion = QUESTIONS[currentQ];
  if (!currentQuestion) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold">お疲れさまでした！</h1>
        <p>こちらで分析を行い、すぐにフィードバックをお送りします。</p>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white" onClick={handleSubmit}>送信する</button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">自己分析診断（全40問）</h1>
      <p className="mb-2">Q{currentQ + 1}. {currentQuestion.text}</p>

      {currentQuestion.type === 'radio' && Array.isArray(currentQuestion.options) && (
        <div className="space-x-2">
          {currentQuestion.options.map((opt) => (
            <button
              key={opt}
              className="px-4 py-2 border rounded"
              onClick={() => handleAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {currentQuestion.type === 'text' && (
        <div className="space-y-2">
          <input
            type="text"
            className="border p-2 w-full"
            onBlur={(e) => handleAnswer(e.target.value)}
            placeholder="例：法学部"
          />
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500">あと {QUESTIONS.length - currentQ - 1} 問</p>
    </div>
  );
}
