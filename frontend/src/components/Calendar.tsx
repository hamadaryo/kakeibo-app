import { useEffect, useState } from 'react';
import Header from './Header'; // 共通ヘッダーをインポート

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
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const formattedCurrentMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const API_BASE_URL = 'http://13.236.87.93:8000';
  
  // データをバックエンドから取得
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

  // 1. 現在表示している月のデータだけを抽出
  const monthlyExpenses = expenses.filter((item) => {
    return item.date.startsWith(formattedCurrentMonth);
  });

  // 2. 収入の合計を計算
  const totalIncome = monthlyExpenses
    .filter((item) => item.category === '給与')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // 3. 支出の合計を計算
  const totalExpense = monthlyExpenses
    .filter((item) => item.category !== '給与')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // 4. 収支の総合計
  const balance = totalIncome - totalExpense;

  // 5. 【修正】現在表示している月のデータ（monthlyExpenses）を日付ごとにグループ化
  const groupedExpenses = monthlyExpenses.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, ExpenseItem[]>);

  // カレンダーグリッド用（ダミー格子サンプル例）
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - 3; 
    return dayNum;
  });

  // 前月ボタンを押したときの処理
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // 翌月ボタンを押したときの処理
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="bg-white min-h-full flex flex-col">
      {/* 1. 共通ヘッダー */}
      <Header>
        <div className="grid grid-cols-[1fr_2fr_1fr] items-center w-full">
          <div></div>
          <div className="flex items-center justify-center space-x-3">
            <button 
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white/10 rounded transition-colors text-lg font-bold"
            >
              &lt;
            </button>
            <span className="text-lg font-bold whitespace-nowrap">
              {currentYear}年{currentMonth}月
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-1 hover:bg-white/10 rounded transition-colors text-lg font-bold"
            >
              &gt;
            </button>
          </div>
          <div className="flex justify-end">
            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
              🔍
            </button>
          </div>
        </div>
      </Header>

      {/* 2. カレンダーグリッド */}
      <div className="sticky top-0 left-0 right-0 bg-white border-b border-gray-200">
        <div className="grid grid-cols-7 text-center text-[11px] py-1 border-b border-gray-100 font-medium">
          <span className="text-red-400">Sun</span>
          <span className="text-gray-500">Mon</span>
          <span className="text-gray-500">Tue</span>
          <span className="text-gray-500">Wed</span>
          <span className="text-gray-500">Thu</span>
          <span className="text-gray-500">Fri</span>
          <span className="text-blue-400">Sat</span>
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 text-[10px]">
          {calendarDays.map((d, idx) => {
            const isCurrentMonth = d >= 1 && d <= 31;
            const isToday = d === 24; 
            const dayNumStr = d > 0 && d <= 31 ? String(d).padStart(2, '0') : '01';
            const dateStr = `${formattedCurrentMonth}-${dayNumStr}`;
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
      <div className="flex justify-around py-3 bg-white border-b border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">収入</p>
          <p className="text-sm font-bold text-green-600">{totalIncome.toLocaleString()}円</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">支出</p>
          <p className="text-sm font-bold text-red-500">{totalExpense.toLocaleString()}円</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">合計</p>
          <p className="text-sm font-bold text-blue-600">{balance.toLocaleString()}円</p>
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
              <div className="bg-amber-50/50 px-4 py-1 text-[11px] text-gray-500 font-medium border-y border-amber-100/60">
                {date}
              </div>
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