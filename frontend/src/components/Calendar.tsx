import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';

type ExpenseItem = {
  id: number;
  date: string;
  amount: number;
  type: string;
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

  // 削除確認ポップアップ用のステート
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

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

  // 削除実行処理
  const handleDeleteConfirm = async () => {
    if (deleteTargetId === null) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/${deleteTargetId}`, {
        method: 'DELETE',
      });
      // 200 OK または 204 No Content を成功とみなす
      if (response.ok || response.status === 204) {
        setExpenses(expenses.filter((item) => item.id !== deleteTargetId));
        alert('削除しました'); 
      } else {
        alert('削除に失敗しました');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const monthlyExpenses = expenses.filter((item) => item.date.startsWith(formattedCurrentMonth));
  const totalIncome = monthlyExpenses.filter((item) => item.category === '給与').reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = monthlyExpenses.filter((item) => item.category !== '給与').reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = totalIncome - totalExpense;

  const groupedExpenses = monthlyExpenses.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, ExpenseItem[]>);

  const calendarDays = Array.from({ length: 35 }, (_, i) => i - 3);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="bg-white min-h-full flex flex-col relative overflow-x-hidden">
      <Header>
        <div className="grid grid-cols-[1fr_2fr_1fr] items-center w-full">
          <div></div>
          <div className="flex items-center justify-center space-x-3">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded transition-colors text-lg font-bold">&lt;</button>
            <span className="text-lg font-bold whitespace-nowrap">{currentYear}年{currentMonth}月</span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded transition-colors text-lg font-bold">&gt;</button>
          </div>
          <div className="flex justify-end">
            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">🔍</button>
          </div>
        </div>
      </Header>

      {/* カレンダーグリッド */}
      <div className="sticky top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
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
            const dayNumStr = d > 0 && d <= 31 ? String(d).padStart(2, '0') : '01';
            const dateStr = `${formattedCurrentMonth}-${dayNumStr}`;
            const dayExpenses = groupedExpenses[dateStr] || [];
            const dayIncome = dayExpenses.filter((e) => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
            const dayExpense = dayExpenses.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);

            return (
              <div key={idx} className="h-12 p-0.5 relative flex flex-col justify-between bg-white">
                <span className={`inline-block w-4 h-4 text-center leading-4 rounded ${isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                  {d > 0 ? d : d + 30}
                </span>
                <div className="text-[9px] text-right leading-tight">
                  {dayIncome > 0 && <div className="text-blue-500 font-medium">{dayIncome.toLocaleString()}円</div>}
                  {dayExpense > 0 && <div className="text-red-400 font-medium">{dayExpense.toLocaleString()}円</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 収入・支出バー */}
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

      {/* 日別明細リスト */}
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
                <div key={item.id} className="relative overflow-hidden border-b border-gray-100 bg-red-500">
                  {/* 背景の赤い削除ボタン（スライドすると現れる） */}
                  <div
                    onClick={() => setDeleteTargetId(item.id)}
                    className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center text-white text-xs font-bold cursor-pointer z-0"
                  >
                    削除
                  </div>

                  {/* スライド可能な前面のレコード */}
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -80, right: 0 }}
                    dragElastic={0.1}
                    className="flex justify-between items-center px-4 py-2.5 text-xs text-gray-700 bg-white relative z-10 cursor-grab active:cursor-grabbing"
                  >
                    <div>
                      <span className="font-medium">{item.category}</span>
                      {item.memo && <span className="text-gray-400 text-[11px] ml-1">({item.memo})</span>}
                    </div>
                    <div className={`font-medium ${item.type === 'expense' ? 'text-gray-800' : 'text-blue-600'}`}>
                      {item.amount.toLocaleString()}円
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* 削除確認ポップアップ（モーダル） */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
            <p className="text-sm font-bold text-gray-800 mb-4">本当に削除してよろしいですか？</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-xs rounded font-medium hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white text-xs rounded font-medium hover:bg-red-600"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}