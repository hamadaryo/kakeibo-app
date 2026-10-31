import { useState } from 'react';
import Add from './components/Add';
import Calendar from './components/Calendar';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import './App.css';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<'add' | 'calendar' | 'analytics' | 'settings'>('add');

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center sm:py-0">
      {/* スマホサイズのメインコンテナ */}
      <div className="relative w-full sm:max-w-md bg-white h-screen sm:h-[840px] sm:rounded-3xl shadow-xl flex flex-col justify-between overflow-hidden border border-slate-200/65">
        {/* メインコンテンツエリア（各タブの画面がここに切り替わります） */}
        <main className="p-0 flex-1 overflow-y-auto pb-20">
          {activeTab === 'add' && <Add />}
          {activeTab === 'calendar' && <Calendar />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'settings' && <Settings />}
        </main>

        {/* 下部固定タブナビゲーション */}
        <nav className="absolute bg-white border-t border-slate-100 px-3 py-2 flex justify-around items-center bottom-0 left-0 right-0 z-10 shadow-lg">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'add' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-xl">✏️</span>
            <span className="text-[11px] mt-0.5">NewYork</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'calendar' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-xl">📅</span>
            <span className="text-[11px] mt-0.5">カレンダー</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'analytics' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="text-[11px] mt-0.5">分析</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'settings' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-xl">⚙️</span>
            <span className="text-[11px] mt-0.5">設定</span>
          </button>
        </nav>

      </div>
    </div>
  );
}