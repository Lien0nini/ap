import React from 'react';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata = {
  title: 'Twix',
  description: '...',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
