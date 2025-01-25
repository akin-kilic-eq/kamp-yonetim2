'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Camp {
  id: string;
  name: string;
  description: string;
  userEmail: string;
}

export default function CampsPage() {
  const router = useRouter();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCamp, setNewCamp] = useState({
    name: '',
    description: ''
  });
  const [currentUser, setCurrentUser] = useState<{ email: string; camps: string[] } | null>(null);

  useEffect(() => {
    // Oturum kontrolü
    const userSession = sessionStorage.getItem('currentUser');
    if (!userSession) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userSession);
    setCurrentUser(user);

    // Kullanıcının kamplarını yükle
    const allCamps = JSON.parse(localStorage.getItem('camps') || '[]');
    const userCamps = allCamps.filter((camp: Camp) => camp.userEmail === user.email);
    setCamps(userCamps);
  }, [router]);

  const handleAddCamp = () => {
    if (!newCamp.name) {
      alert('Lütfen kamp adını girin');
      return;
    }

    if (!currentUser) {
      router.push('/login');
      return;
    }

    const campId = Date.now().toString();
    const newCampData: Camp = {
      id: campId,
      name: newCamp.name,
      description: newCamp.description,
      userEmail: currentUser.email
    };

    // Tüm kampları al ve yeni kampı ekle
    const allCamps = JSON.parse(localStorage.getItem('camps') || '[]');
    allCamps.push(newCampData);
    localStorage.setItem('camps', JSON.stringify(allCamps));

    // Kullanıcının kamplarını güncelle
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((user: any) => {
      if (user.email === currentUser.email) {
        return {
          ...user,
          camps: [...user.camps, campId]
        };
      }
      return user;
    });
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // State'i güncelle
    setCamps([...camps, newCampData]);
    setShowAddModal(false);
    setNewCamp({ name: '', description: '' });
  };

  const handleCampClick = (campName: string) => {
    // URL'de Türkçe karakterleri ve boşlukları düzelt
    const formattedName = campName.toLowerCase().replace(/\s+/g, '');
    router.push(`/${formattedName}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-[url('/arka-plan-guncel-2.jpg')] bg-cover bg-center bg-fixed">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Kamplarım</h1>
              <p className="text-gray-600">Yönettiğiniz kampların listesi</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Kamp Ekle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {camps.map((camp) => (
            <div
              key={camp.id}
              onClick={() => handleCampClick(camp.name)}
              className="bg-white/90 backdrop-blur-sm overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{camp.name}</h3>
                  <div className="bg-blue-100 rounded-full p-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                {camp.description && (
                  <p className="text-gray-600">{camp.description}</p>
                )}
                <div className="mt-4 flex justify-end">
                  <span className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700">
                    Yönetim Paneline Git
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Yeni Kamp Ekle</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="campName" className="block text-sm font-medium text-gray-700 mb-2">
                  Kamp Adı
                </label>
                <input
                  type="text"
                  id="campName"
                  value={newCamp.name}
                  onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                  placeholder="Kampın adını girin"
                />
              </div>
              <div>
                <label htmlFor="campDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama (İsteğe bağlı)
                </label>
                <textarea
                  id="campDescription"
                  value={newCamp.description}
                  onChange={(e) => setNewCamp({ ...newCamp, description: e.target.value })}
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                  placeholder="Kamp hakkında kısa bir açıklama yazın"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCamp({ name: '', description: '' });
                }}
                className="px-6 py-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                İptal
              </button>
              <button
                onClick={handleAddCamp}
                className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 