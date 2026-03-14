import "./globals.css";

export const metadata = {
  title: "SKYE PROMPT ENGINE",
  description: "AI-powered image → perfect prompt. LoRA ready.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
