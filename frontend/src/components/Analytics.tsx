import { useEffect, useState } from 'react';
import Header from './Header';

type ExpenseItem = {
  id: number;
  date: string;
  amount: number;
  type: string;
  category: string;
  memo?: string;
};

export default function Analytics() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [advice, setAdvice] = useState<string | null>(null);

  // 現在の年月（例: 2026-11）
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const formattedCurrentMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  
  const API_BASE_URL = 'http://13.236.87.93:8000';

  // データの取得
  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // 今月のデータのみをフィルタリング
  const monthlyExpenses = expenses.filter((item) => item.date.startsWith(formattedCurrentMonth));
  const totalIncome = monthlyExpenses.filter((item) => item.category === '給与').reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = monthlyExpenses.filter((item) => item.category !== '給与').reduce((sum, item) => sum + Number(item.amount), 0);

  // AI分析を呼び出す関数
  const handleAiAnalyze = async () => {
    if (monthlyExpenses.length === 0) {
      alert('今月のデータがありません');
      return;
    }

    setAiLoading(true);
    setAdvice(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses: monthlyExpenses }),
      });
      const data = await response.json();
      if (response.ok) {
        setAdvice(data.advice);
      } else {
        alert('AI分析に失敗しました');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-full flex flex-col">
      {/* ヘッダー */}
      <Header>
        <div className="text-center w-full">
          <span className="text-lg font-bold">家計簿分析</span>
        </div>
      </Header>

      <div className="p-4 flex-1 space-y-4">
        {/* 月選択バー */}
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
          <button
            onClick={() => {
              if (currentMonth === 1) { setCurrentYear(currentYear - 1); setCurrentMonth(12); }
              else { setCurrentMonth(currentMonth - 1); }
              setAdvice(null);
            }}
            className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold hover:bg-gray-100"
          >
            &lt; 前月
          </button>
          <span className="text-sm font-bold text-gray-800">{currentYear}年{currentMonth}月</span>
          <button
            onClick={() => {
              if (currentMonth === 12) { setCurrentYear(currentYear + 1); setCurrentMonth(1); }
              else { setCurrentMonth(currentMonth + 1); }
              setAdvice(null);
            }}
            className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold hover:bg-gray-100"
          >
            次月 &gt;
          </button>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 text-center">
            <p className="text-[11px] text-gray-500 font-medium">今月の収入</p>
            <p className="text-sm font-bold text-blue-600 mt-1">{totalIncome.toLocaleString()}円</p>
          </div>
          <div className="bg-red-50/60 p-3 rounded-lg border border-red-100 text-center">
            <p className="text-[11px] text-gray-500 font-medium">今月の支出</p>
            <p className="text-sm font-bold text-red-500 mt-1">{totalExpense.toLocaleString()}円</p>
          </div>
        </div>

        {/* AIアドバイザーセクション */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🤖</span>
            <h2 className="text-xs font-bold text-gray-800">Gemini AI 家計簿アドバイザー</h2>
          </div>
          <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
            今月の登録データをもとに、AIが支出の傾向や節約のアドバイスを診断します。
          </p>

          <button
            onClick={handleAiAnalyze}
            disabled={aiLoading || loading}
            className="w-full py-2.5 bg-orange-500 text-white text-xs rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-sm disabled:bg-gray-300"
          >
            {aiLoading ? 'AIが分析中...' : '今月の家計をAIに診断してもらう'}
          </button>

          {/* AIからのアドバイス表示エリア */}
          {advice && (
            <div className="mt-4 p-3.5 bg-white rounded-lg border border-orange-200 text-xs text-gray-700 whitespace-pre-wrap leading-relaxed shadow-inner">
              {advice}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}