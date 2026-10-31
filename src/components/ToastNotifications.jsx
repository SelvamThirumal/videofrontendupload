import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastNotifications() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#0F1523',
          color: '#F1F5F9',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          fontSize: '13px',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#0F1523',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#0F1523',
          },
        },
      }}
    />
  );
}
