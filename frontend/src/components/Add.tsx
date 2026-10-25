import React, { useRef, useState } from 'react';
import Header from './Header'; // 共通ヘッダーをインポート

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
  const API_BASE_URL = 'http://localhost:5173/';

  // 収支タイプ変更時の処理
  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };
  // 1. input要素への参照を作成
  const InputRef = useRef<HTMLInputElement>(null);

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
    <div className="bg-[#fffff6] min-h-full flex flex-col -m-5">
      {/* 1. 共通ヘッダー（Add画面専用の中身を配置） */}
      <Header>
        <div className="bg-gray-100 rounded-full w-[75%] mx-auto flex justify-center space-x-4">
          {/* 支出 / 収入 タブ切替（アニメーション付き） */}
          <div className="relative flex bg-gray-100 p-1 rounded-full w-full">
            {/* 選択中に左右へ滑らかにスライドするオレンジの背景（つまみ） */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                type === 'income' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />

            {/* 支出ボタン */}
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`relative z-10 flex-1 py-2 text-sm font-bold transition-colors duration-300 ${
                type === 'expense' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              支出
            </button>

            {/* 収入ボタン */}
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`relative z-10 flex-1 py-2 text-sm font-bold transition-colors duration-300 ${
                type === 'income' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              収入
            </button>
          </div>
          </div>
      </Header>
      {message && (
        <div className={`p-3 rounded-full text-sm mb-4 text-center ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
       
      <br/>
        {/* 金額 */}
        <div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-bold text-gray-400 pointer-events-none">
            金額
          </span>          
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-65 py-3 border border-gray-200 focus:outline-none focus:bg-gray-100 text-gray-800 bg-white text-right"
            required
            min="0"
          />
        </div>
      </div>

        {/* 日付 */}
        <div>
          <div className="relative">
            <div 
                onClick={() => {
                  if (InputRef.current) {
                    InputRef.current.showPicker?.();
                    InputRef.current.focus();
                  }
                }}
                className="relative cursor-pointer w-full pl-65 pr-4 py-3 border border-gray-200 bg-white rounded-none flex items-center justify-end"
            >
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-bold text-gray-400 pointer-events-none">
                日付
              </span>
              
              {/* 実際の値を右端に綺麗に表示する */}
              <span className="text-gray-800 text-sm">
                {date || "2026-10-24"}
              </span>

              {/* 隠し date 入力（クリックやフォーカスを受け付けるため） */}
              <input
                ref={InputRef}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                required
              />
            </div>
          </div>
        {/* カテゴリー */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-bold text-gray-400 pointer-events-none">
            カテゴリー
          </span>          
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-200 focus:outline-none focus:bg-gray-100 text-gray-800 bg-white text-right"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* メモ */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-bold text-gray-400 pointer-events-none">
            メモ
          </span>          
          <input
            type="text"
            placeholder="店名や用途など"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-3 border border-gray-200 focus:outline-none focus:bg-gray-100 text-gray-800 bg-white text-right"
          />
        </div>
        </div>

        {/* 登録ボタン */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-[70%] mx-auto py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors shadow-md disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : '登録する'}
        </button>
      </form>
    </div>
  );
}