import { type ReactNode } from 'react';

type HeaderProps = {
  children: ReactNode; // ヘッダーの中に差し込む固有のコンテンツ
};

export default function Header({ children }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-[#e07a38] text-white py-3 px-4 flex justify-between items-center shrink-0">
        {children}
    </header>
  );
}