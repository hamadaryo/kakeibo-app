import { useState } from 'react'

// 家計簿のデータの型（TypeScriptの型定義）
interface Transaction {
  id: number;
  title: string;
  amount: number;
}

function App() {
  // 入力フォームの文字を管理する状態
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  
  // 登録された家計簿のリストを管理する状態
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // フォームが送信されたときに実行される関数
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() // ページが勝手にリロードされるのを防ぐ
    if (!title || !amount) return

    // 新しいデータのオブジェクトを作る
    const newTransaction: Transaction = {
      id: Date.now(),
      title: title,
      amount: Number(amount),
    }

    // リストに新しいデータを追加する
    setTransactions([...transactions, newTransaction])
    
    // 入力フォームを空っぽにリセットする
    setTitle('')
    setAmount('')
  }

  return (
    <div style={{ padding: '30px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>家計簿アプリ</h1>

      {/* 1. 入力フォーム */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="項目名（例：食費）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input
          type="number"
          placeholder="金額（例：1000）"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '10px', fontSize: '16px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
          記録する
        </button>
      </form>

      {/* 2. 一覧表示エリア */}
      <h2>履歴</h2>
      {transactions.length === 0 ? (
        <p style={{ color: '#888' }}>まだ記録がありません</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {transactions.map((t) => (
            <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>{t.title}</span>
              <strong>{t.amount}円</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App