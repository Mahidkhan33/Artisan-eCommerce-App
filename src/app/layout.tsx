import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import ToastContainer from "@/components/ToastContainer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArtisanAlley | Premium Handcrafted Ceramics, Leather & Textiles",
  description: "Connect directly with independent craftsmen and artisans. Explore hand-thrown glazed stoneware, vegetable-tanned leather, handwoven tapestries, and artisan carvings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FBFBFA] text-slate-800 selection:bg-emerald-200 selection:text-emerald-900">
        <AppProvider>
          {children}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
