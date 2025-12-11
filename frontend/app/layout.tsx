import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "네이버 광고 자동입찰 시스템",
  description: "네이버 검색광고 및 디스플레이 광고 자동입찰 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
