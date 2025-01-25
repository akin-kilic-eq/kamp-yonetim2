'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function CampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();

  const handleLogout = () => {
    localStorage.removeItem('selectedCampId');
    router.push('/login');
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/${params.camp}/dashboard`} className="flex-shrink-0">
                <img
                  src="/antteq-logo.png"
                  alt="ANTTEQ Logo"
                  className="h-8 w-auto"
                />
              </Link>
              <div className="ml-10 flex items-center space-x-6">
                <Link
                  href={`/${params.camp}/rooms`}
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-bold"
                >
                  Odalar
                </Link>
                <Link
                  href={`/${params.camp}/workers`}
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-bold"
                >
                  İşçiler
                </Link>
                <Link
                  href={`/${params.camp}/report`}
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-bold"
                >
                  Rapor
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/camps"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                Kamplarım
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 