import "./globals.css";
import AppShell from "@/components/AppShell/AppShell";
import { AdminLanguageProvider } from "@/components/providers/AdminLanguageProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AdminLanguageProvider>
          <AppShell>{children}</AppShell>
        </AdminLanguageProvider>
      </body>
    </html>
  );
}
