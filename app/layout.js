import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AR Food SaaS | Virtual Dining Experience',
  description: 'Transform your restaurant menu into a 3D augmented reality experience. QR codes, Analytics, and AI optimization for the modern restaurant.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
