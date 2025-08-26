import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header/Header";
import { KEYWORDS } from "@/config/metadataConfig";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

//Generate related files: https://favicon.io/favicon-converter/

export const metadata: Metadata = {
	title: "WebVizion Template",
	description: "A template to make things easier to setup",
	keywords: KEYWORDS,
	icons: {
		icon: "/favicon-32x32.png",
		shortcut: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
	manifest: "/site.webmanifest",
	robots: {
		index: true,
		follow: true,
	},
};

export const viewport: Viewport = {
	themeColor: "#0f172a",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} antialiased`}>
				<Header />
				{children}
				<Footer />
			</body>
		</html>
	);
}
