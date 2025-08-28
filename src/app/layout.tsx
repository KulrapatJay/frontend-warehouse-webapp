import CustomToaster from "@/components/ui/Alert";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import React from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
        try {
          var t = localStorage.getItem('theme') || 'light';
          document.documentElement.setAttribute('data-theme', t);
        } catch (e) {}
      `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <CustomToaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
