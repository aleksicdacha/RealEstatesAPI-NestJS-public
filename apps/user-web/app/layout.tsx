import './globals.css';
import { mainFont } from './config/fonts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className={mainFont.variable}>
      <body className={mainFont.className}>{children}</body>
    </html>
  );
}
