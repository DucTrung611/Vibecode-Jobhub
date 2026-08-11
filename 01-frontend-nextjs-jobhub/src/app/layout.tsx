import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/shared/context/auth.context";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  weight: ["700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "JobHub",
  description: "Your next chapter starts at the waypoint.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolageGrotesque.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
