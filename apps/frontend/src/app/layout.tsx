import { ThemeProvider } from "@/utils/theme-provider";
import type { Metadata } from "next";

import Footer from "@/app/shared/footer";
import Header from "@/app/shared/header";

import { inter } from "@/app/fonts";

import "@/app/globals.css";
import { cn } from "@/utils/class-names";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          "flex min-h-screen flex-col justify-between bg-background text-foreground",
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
