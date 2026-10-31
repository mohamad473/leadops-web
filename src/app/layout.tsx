import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LeadOps',
  description: 'LeadOps control center: campaigns, leads, replies and the IronWomen bot.',
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
