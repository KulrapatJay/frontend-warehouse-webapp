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
    <html lang="en" data-theme="light" suppressHydrationWarning>
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
