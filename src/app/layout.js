import "./globals.css";

const FAVICON = "https://drive.google.com/uc?export=view&id=1zsH0eR_OAeQA42uYDU0k_LsCunpGW1MV";

export const metadata = {
  title: "SKYE PROMPT ENGINE",
  description: "AI-powered · image → perfect prompt · LoRA ready.",
  icons: {
    icon: FAVICON,
    shortcut: FAVICON,
    apple: FAVICON,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
