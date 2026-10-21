import React, { useState, useEffect } from 'react';
import './App.css';

// 家計簿データの型定義
interface Expense {
  id: number;
  date: string;
  amount: number;
  category: string;
  memo?: string;
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [memo, setMemo] = useState('');

  // 1. ページ読み込み時にバックエンドからデータを取得（GET）
  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // 2. フォーム送信時にデータをバックエンドに保存（POST）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount || !category) {
      alert('日付、金額、カテゴリは必須です');
      return;
    }

    const newExpense = {
      date,
      amount: parseFloat(amount),
      category,
      memo,
    };

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      });

      if (response.ok) {
        // 入力欄をクリア
        setDate('');
        setAmount('');
        setCategory('');
        setMemo('');
        // リストを再取得して画面を更新
        fetchExpenses();
      } else {
        alert('保存に失敗しました');
      }
    } catch (error) {
      console.error('通信エラー:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>💰 家計簿アプリ</h1>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>支出の追加</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>日付: </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>金額 (円): </label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>カテゴリ: </label>
          <input type="text" value={category} placeholder="例: 食費" onChange={(e) => setCategory(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>メモ: </label>
          <input type="text" value={memo} placeholder="例: スーパー" onChange={(e) => setMemo(e.target.value)} />
        </div>
        <button type="submit" style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          保存する
        </button>
      </form>

      {/* 一覧表示 */}
      <h3>支出一覧</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {expenses.map((item) => (
          <li key={item.id} style={{ background: '#fff', border: '1px solid #ddd', padding: '10px', marginBottom: '8px', borderRadius: '4px' }}>
            <strong>{item.date}</strong> | {item.category} : <strong>¥{item.amount}</strong> 
            {item.memo && <span style={{ color: '#666', marginLeft: '10px' }}>({item.memo})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;