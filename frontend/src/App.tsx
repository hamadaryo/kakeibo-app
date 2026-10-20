import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState<string>("読み込み中...")

  // FastAPIからデータを取得する処理
  useEffect(() => {
    // ※ここにあなたのEC2のパブリックIPアドレスを入力してください
    // 例: http://<EC2のIP>:8000/
    fetch('http://13.236.87.93:8000/')
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message) // FastAPIから返ってきたメッセージを設定
      })
      .catch((err) => {
        console.error("通信エラー:", err)
        setMessage("バックエンドとの通信に失敗しました")
      })
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>フルスタックアプリ開発</h1>
      <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>バックエンドからのメッセージ：</h3>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff' }}>{message}</p>
      </div>
    </div>
  )
}

export default App