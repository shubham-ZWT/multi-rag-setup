import type { Metadata } from "next";
import { Albert_Sans, Barlow } from "next/font/google";
import "./globals.css";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import HomeThemeProvider from "../components/providers/HomeThemeProvider";

const albert_Sans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert-sans",
  weight: "400",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Multi RAG Platform",
  description: "A platform to manage and deploy RAG bots with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${albert_Sans.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HomeThemeProvider>
          <Navbar />
          {children}
          <Footer />
        </HomeThemeProvider>
      </body>
    </html>
  );
}
