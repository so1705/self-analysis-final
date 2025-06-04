// pages/result/[id].tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/firebase';

type Scores = {
  [category: string]: number;
};

type Result = {
  name: string;
  grade: string;
  faculty: string;
  scores: Scores;
};

export default function ResultPage() {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const docRef = doc(db, 'results', id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Result;
        setResult(data);
      } else {
        console.log('No such document!');
      }
    };

    fetchData();
  }, [id]);

  if (!result) return <p>読み込み中...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">自己分析結果</h1>
      <p className="mb-2">🧑‍🎓 お名前：{result.name}</p>
      <p className="mb-2">📘 学年：{result.grade}</p>
      <p className="mb-2">🏫 学部：{result.faculty}</p>

      <h2 className="text-xl font-bold mt-6 mb-2">📊 カテゴリ別スコア</h2>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(result.scores).map(([key, value]) => (
          <div key={key} className="border p-2 rounded">
            <strong>{key}</strong>：{value}点
          </div>
        ))}
      </div>
    </div>
  );
}
