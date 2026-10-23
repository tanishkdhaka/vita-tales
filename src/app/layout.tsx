import type { Metadata, Viewport } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import ToasterProvider from "@/components/public/ToasterProvider";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = process.env.SITE_NAME || "Vita Tales";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Stories of Lives That Shaped Our World`,
    template: `%s | ${siteName}`,
  },
  description:
    "Discover the extraordinary journeys of thinkers, scientists, leaders, writers, and visionaries who shaped our world. In-depth biographies and human stories.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteName,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1c1917",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${newsreader.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('chronicle_reading_theme');
                if (t === 'dark' || t === 'sepia') {
                  document.documentElement.setAttribute('data-theme', t);
                  if (t === 'dark') document.documentElement.classList.add('dark');
                }
                const s = localStorage.getItem('chronicle_font_scale');
                if (s) {
                  document.documentElement.style.setProperty('--reading-font-scale', s);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-surface text-text-primary font-sans antialiased min-h-screen selection:bg-brand-200 selection:text-brand-950 transition-colors duration-200">
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to main content
        </a>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
