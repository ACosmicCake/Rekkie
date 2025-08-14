import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import AuthButton from "@/components/AuthButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "City Event Finder",
  description: "Find events in your city, tailored to you.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b">
          <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
            <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
              <a href="/" className="flex items-center">
                <span className="self-center text-xl font-semibold whitespace-nowrap">City Events</span>
              </a>
              <div className="flex items-center lg:order-2">
                <AuthButton session={session} />
              </div>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
