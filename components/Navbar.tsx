'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const params = useParams();
  const [campName, setCampName] = useState('');
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const userSession = sessionStorage.getItem('currentUser');
    if (userSession) {
      setCurrentUser(JSON.parse(userSession));
    }

    if (params.camp) {
      const camps = JSON.parse(localStorage.getItem('camps') || '[]');
      const currentCamp = camps.find((camp: any) => 
        camp.name.toLowerCase().replace(/\s+/g, '') === params.camp
      );
      if (currentCamp) {
        setCampName(currentCamp.name);
      }
    }
  }, [params.camp]);

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    router.push('/login');
  };

  const handleNavigate = (path: string) => {
    if (params.camp) {
      router.push(`/${params.camp}/${path}`);
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">{campName || 'Kamp Yönetimi'}</span>
            </div>
            {params.camp && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => handleNavigate('dashboard')}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavigate('rooms')}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Odalar
                </button>
                <button
                  onClick={() => handleNavigate('workers')}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  İşçiler
                </button>
                <button
                  onClick={() => handleNavigate('report')}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Rapor
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {currentUser && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{currentUser.email}</span>
                <button
                  onClick={() => router.push('/camps')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Kamplar
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 