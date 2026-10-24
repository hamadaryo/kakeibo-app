import React, { useState } from 'react';

// カテゴリーの初期候補
const EXPENSE_CATEGORIES = ['食費', '日用品', '交通費', '衣服', '交際費', '趣味', '通信費', '家賃', 'その他'];
const INCOME_CATEGORIES = ['給与', '賞与', '副収入', '臨時収入', 'その他'];

export default function Add() {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [memo, setMemo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 収支タイプ変更時の処理
  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  // フォーム送信処理（API呼び出し）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setMessage({ text: '正しい金額を入力してください', isError: true });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          amount: Number(amount),
          type,
          category,
          memo,
        }),
      });
      

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      setMessage({ text: '登録しました！', isError: false });
      setAmount('');
      setMemo('');
    } catch (err) {
      setMessage({ text: 'エラーが発生しました。バックエンドが起動しているか確認してください。', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">収支の登録</h2>

      {message && (
        <div className={`p-3 rounded-lg text-sm mb-4 text-center ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 支出 / 収入 タブ切替 */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              type === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500'
            }`}
          >
            支出
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              type === 'income' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500'
            }`}
          >
            収入
          </button>
        </div>

        {/* 日付 */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            required
          />
        </div>

        {/* 金額 */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">金額 (円)</label>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 text-2xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            required
            min="1"
          />
        </div>

        {/* カテゴリー */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">カテゴリー</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* メモ */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">メモ (任意)</label>
          <input
            type="text"
            placeholder="店名や用途など"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
        </div>

        {/* 登録ボタン */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : '登録する'}
        </button>
      </form>
    </div>
  );
}