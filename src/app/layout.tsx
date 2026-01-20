import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "수능 국어 비문학 문제 생성기",
  description: "AI를 활용한 수능 국어 비문학 문제 자동 생성 시스템",
  keywords: ["수능", "국어", "비문학", "문제 생성", "AI", "교육"],
  authors: [{ name: "KSAT Generator" }],
  openGraph: {
    title: "수능 국어 비문학 문제 생성기",
    description: "AI를 활용한 수능 국어 비문학 문제 자동 생성 시스템",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}