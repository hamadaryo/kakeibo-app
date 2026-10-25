import { type ReactNode } from 'react';

type HeaderProps = {
  children: ReactNode; // ヘッダーの中に差し込む固有のコンテンツ
};

export default function Header({ children }: HeaderProps) {
  return (
    <header className="bg-[#e07a38] text-white py-3 px-4 flex justify-between items-center shrink-0">
      {children}
    </header>
  );
}