import type { Metadata } from "next";
import { Archivo, Archivo_Narrow, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PanelHost } from "@/components/shell/panel-host";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "TrailLink Nepal — Find Your Trail. Find Your People.",
    template: "%s — TrailLink Nepal",
  },
  description:
    "The social hiking and travel platform for Nepal. Discover trekking destinations, join group hikes, meet fellow adventurers, and book verified local guides.",
  openGraph: {
    title: "TrailLink Nepal",
    description: "Find Your Trail. Find Your People.",
    siteName: "TrailLink Nepal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrailLink Nepal",
    description: "Find Your Trail. Find Your People.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoNarrow.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-stone-50 pb-16 lg:pb-0">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
          <PanelHost />
        </AuthProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}