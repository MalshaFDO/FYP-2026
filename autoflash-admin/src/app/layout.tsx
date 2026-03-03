import "./globals.css";
import Sidebar from "@/components/Sidebar/sidebar";
import Header from "@/components/Header/header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div style={{ display: "flex" }}>
          <Sidebar />

          <div style={{ marginLeft: "250px", width: "100%" }}>
            <Header />

            <main style={{ padding: "30px" }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
