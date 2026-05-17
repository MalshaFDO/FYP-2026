import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

export const metadata = {
  title: "AutoFlash",
  description: "Smart Vehicle Service & Quotation System",
  icons: {
    icon: "/AFLOG.jpg",
    shortcut: "/AFLOG.jpg",
    apple: "/AFLOG.jpg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
