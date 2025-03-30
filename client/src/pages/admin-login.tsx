import React from 'react';
import PasswordProtection from '@/components/admin/PasswordProtection';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <PasswordProtection 
          targetRoute="/admin" 
          correctPassword="Silky2027" 
        />
      </main>
      
      <Footer />
    </div>
  );
}