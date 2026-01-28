import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Cloud Advisor - AI-Powered Q&A System",
    description: "Get expert guidance on Google Cloud Platform and Google Workspace. Ask questions about cloud migration, infrastructure, security, and best practices.",
    keywords: ["Google Cloud", "GCP", "Google Workspace", "Cloud Advisor", "AI", "Q&A"],
};

export default function RootLayout({
  	children,
}: Readonly<{ children: React.ReactNode;}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
		<Toaster position="bottom-right" richColors/>
      </body>
    </html>
  );
}
