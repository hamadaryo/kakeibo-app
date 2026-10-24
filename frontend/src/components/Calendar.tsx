import { useEffect, useState } from 'react';

type ExpenseItem = {
  id: number;
  date: string; // YYYY-MM-DD
  amount: number;
  type: string; // 'expense' | 'income'
  category: string;
  memo?: string;
};

export default function Calendar() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // データをバックエンドから取得
  const fetchExpenses = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/expenses');
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

  // 集計計算
  const totalIncome = expenses
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = expenses
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  // 日付ごとのグループ化
  const groupedExpenses = expenses.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, ExpenseItem[]>);

  // カレンダーグリッド用（10月表示用のダミー格子サンプル例）
  // 実際の日付セルデータ（10月1日〜31日＋前後の日付）
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - 3; // 27〜31(前月)＋1〜30/31
    return dayNum;
  });

  return (
    <div className="bg-white min-h-full flex flex-col -m-5">
      {/* 1. オレンジヘッダー */}
      <div className="bg-[#e07a38] text-white py-3 px-4 flex justify-between items-center relative">
        <div className="flex-1 text-center flex justify-center items-center space-x-6">
          <button className="text-xl font-bold hover:opacity-75">‹</button>
          <span className="text-xl font-bold tracking-wide">2026年10月</span>
          <button className="text-xl font-bold hover:opacity-75">›</button>
        </div>
        <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
          🔍
        </button>
      </div>

      {/* 2. カレンダーグリッド */}
      <div className="bg-white border-b border-gray-200">
        {/* 曜日 */}
        <div className="grid grid-cols-7 text-center text-[11px] py-1 border-b border-gray-100 font-medium">
          <span className="text-red-400">Sun</span>
          <span className="text-gray-500">Mon</span>
          <span className="text-gray-500">Tue</span>
          <span className="text-gray-500">Wed</span>
          <span className="text-gray-500">Thu</span>
          <span className="text-gray-500">Fri</span>
          <span className="text-blue-400">Sat</span>
        </div>

        {/* 日付格子 */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 text-[10px]">
          {calendarDays.map((d, idx) => {
            const isCurrentMonth = d >= 1 && d <= 31;
            const isToday = d === 24; // 24日強調表示
            const dateStr = `2026-10-${d < 10 ? '0' + d : d}`;
            const dayExpenses = groupedExpenses[dateStr] || [];

            const dayIncome = dayExpenses
              .filter((e) => e.type === 'income')
              .reduce((sum, e) => sum + e.amount, 0);

            const dayExpense = dayExpenses
              .filter((e) => e.type === 'expense')
              .reduce((sum, e) => sum + e.amount, 0);

            return (
              <div key={idx} className="h-12 p-0.5 relative flex flex-col justify-between bg-white">
                <div className="flex justify-between items-start">
                  <span
                    className={`inline-block w-4 h-4 text-center leading-4 rounded ${
                      isToday
                        ? 'bg-[#e07a38] text-white font-bold'
                        : isCurrentMonth
                        ? 'text-gray-700'
                        : 'text-gray-300'
                    }`}
                  >
                    {d > 0 ? d : d + 30}
                  </span>
                </div>
                {/* 収支金額 */}
                <div className="text-[9px] text-right leading-tight">
                  {dayIncome > 0 && <div className="text-blue-500 font-medium">{dayIncome.toLocaleString()}円</div>}
                  {dayExpense > 0 && <div className="text-red-400 font-medium">{dayExpense.toLocaleString()}円</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 収入・支出・合計バー */}
      <div className="grid grid-cols-3 text-center py-2 bg-gray-50 border-b border-gray-200 text-xs">
        <div>
          <div className="text-gray-400 text-[10px]">収入</div>
          <div className="font-bold text-gray-800 text-sm">{totalIncome.toLocaleString()}円</div>
        </div>
        <div>
          <div className="text-gray-400 text-[10px]">支出</div>
          <div className="font-bold text-gray-800 text-sm">{totalExpense.toLocaleString()}円</div>
        </div>
        <div>
          <div className="text-gray-400 text-[10px]">合計</div>
          <div className={`font-bold text-sm ${totalBalance < 0 ? 'text-gray-800' : 'text-blue-600'}`}>
            {totalBalance.toLocaleString()}円
          </div>
        </div>
      </div>

      {/* 4. 日別明細リスト */}
      <div className="divide-y divide-gray-100 flex-1 bg-white">
        {loading ? (
          <div className="p-4 text-center text-gray-400 text-xs">読み込み中...</div>
        ) : Object.keys(groupedExpenses).length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-xs">登録されている明細がありません</div>
        ) : (
          Object.entries(groupedExpenses).map(([date, items]) => (
            <div key={date}>
              {/* 日付見出し */}
              <div className="bg-amber-50/50 px-4 py-1 text-[11px] text-gray-500 font-medium border-y border-amber-100/60">
                {date}
              </div>
              {/* 明細行 */}
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                  <div>
                    <span className="font-medium">{item.category}</span>
                    {item.memo && <span className="text-gray-400 text-[11px] ml-1">({item.memo})</span>}
                  </div>
                  <div className={`font-medium ${item.type === 'expense' ? 'text-gray-800' : 'text-blue-600'}`}>
                    {item.amount.toLocaleString()}円
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}