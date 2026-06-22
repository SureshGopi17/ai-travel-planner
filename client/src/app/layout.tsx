import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Travel Planner - Generate Custom Itineraries",
  description: "Plan your next adventure with the power of artificial intelligence. Get personalized day-by-day itineraries, smart budget estimates, hotel recommendations, and packing lists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-950">
      <body className={`${inter.className} flex flex-col min-h-screen text-slate-100 bg-slate-950 antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
