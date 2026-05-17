import "./globals.css";
import AppShell from "@/components/AppShell/AppShell";
import { AdminLanguageProvider } from "@/components/providers/AdminLanguageProvider";

export const metadata = {
  title: "AutoFlash Admin",
  description: "Admin dashboard for AutoFlash operations",
  icons: {
    icon: "/AFLOG.jpg",
    shortcut: "/AFLOG.jpg",
    apple: "/AFLOG.jpg",
  },
};

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
