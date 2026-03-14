import "./globals.css";

const faviconUrl = "https://drive.google.com/thumbnail?id=1zsH0eR_OAeQA42uYDU0k_LsCunpGW1MV&sz=w128";

export const metadata = {
  title: "SKYE PROMPT ENGINE",
  description: "AI-POWERED · IMAGE → PERFECT PROMPT · LORA READY",
  icons: { icon: faviconUrl, shortcut: faviconUrl, apple: faviconUrl },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
