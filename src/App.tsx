import React from 'react';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Layout />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1F35',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </>
  );
}
