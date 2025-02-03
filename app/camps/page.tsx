'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Camp {
  id: string;
  name: string;
  description: string;
  userEmail: string;
  code: string;
  sharedWith?: string[];
}

export default function CampsPage() {
  const router = useRouter();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [newCamp, setNewCamp] = useState({
    name: '',
    description: ''
  });
  const [joinCampCode, setJoinCampCode] = useState('');
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
    const userCamps = allCamps.filter((camp: Camp) => 
      camp.userEmail === user.email || (camp.sharedWith || []).includes(user.email)
    );
    setCamps(userCamps);

    // Son ziyaret edilen kamp kontrolü
    const lastVisitedCamp = sessionStorage.getItem('lastVisitedCamp');
    const currentCampData = localStorage.getItem('currentCamp');
    
    if (lastVisitedCamp && currentCampData) {
      const currentCamp = JSON.parse(currentCampData);
      if (currentCamp.currentUserEmail !== user.email) {
        localStorage.removeItem('currentCamp');
        sessionStorage.removeItem('lastVisitedCamp');
      }
    }
  }, [router]);

  const generateCampCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

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
    const campCode = generateCampCode();
    const newCampData: Camp = {
      id: campId,
      name: newCamp.name,
      description: newCamp.description,
      userEmail: currentUser.email,
      code: campCode,
      sharedWith: []
    };

    // Tüm kampları al
    const allCamps = JSON.parse(localStorage.getItem('camps') || '[]');
    
    // Benzersiz kod kontrolü
    while (allCamps.some((camp: Camp) => camp.code === campCode)) {
      newCampData.code = generateCampCode();
    }

    // Yeni kampı ekle
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

  const handleJoinCamp = () => {
    if (!joinCampCode) {
      alert('Lütfen kamp kodunu girin');
      return;
    }

    if (!currentUser) {
      router.push('/login');
      return;
    }

    const allCamps = JSON.parse(localStorage.getItem('camps') || '[]');
    const existingCamp = allCamps.find((camp: Camp) => camp.code === joinCampCode);
    
    if (!existingCamp) {
      alert('Geçersiz kamp kodu');
      return;
    }

    // Zaten eklenmiş mi kontrol et
    if (existingCamp.sharedWith?.includes(currentUser.email)) {
      alert('Bu kampa zaten eklendiniz');
      setShowJoinModal(false);
      setJoinCampCode('');
      return;
    }

    // Kampı paylaşılan kullanıcılara ekle
    const updatedCamps = allCamps.map((camp: Camp) => {
      if (camp.code === joinCampCode) {
        return {
          ...camp,
          sharedWith: [...(camp.sharedWith || []), currentUser.email]
        };
      }
      return camp;
    });

    localStorage.setItem('camps', JSON.stringify(updatedCamps));

    // Güncellenmiş kampı bul
    const joinedCamp = updatedCamps.find((camp: Camp) => camp.code === joinCampCode);
    if (joinedCamp) {
      // State'i güncelle
      setCamps(updatedCamps.filter((camp: Camp) => 
        camp.userEmail === currentUser.email || (camp.sharedWith || []).includes(currentUser.email)
      ));
      
      // URL'yi oluştur
      const formattedName = joinedCamp.name.toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '');

      // Kampı localStorage'a kaydet
      localStorage.setItem('currentCamp', JSON.stringify(joinedCamp));
      
      // Modalı kapat ve yönlendir
      setShowJoinModal(false);
      setJoinCampCode('');
      router.push(`/${formattedName}/dashboard`);
    }
  };

  const handleCampClick = (camp: Camp) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // URL'yi oluştur
    const formattedName = camp.name.toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/\s+/g, '');

    // Kampı localStorage'a kaydet
    localStorage.setItem('currentCamp', JSON.stringify(camp));
    
    // Yönlendirme yap
    router.push(`/${formattedName}/dashboard`);
  };

  const handleEditCamp = () => {
    if (!selectedCamp || !selectedCamp.name) {
      alert('Lütfen kamp adını girin');
      return;
    }

    const allCamps = JSON.parse(localStorage.getItem('camps') || '[]');
    const updatedCamps = allCamps.map((camp: Camp) => 
      camp.id === selectedCamp.id ? selectedCamp : camp
    );

    localStorage.setItem('camps', JSON.stringify(updatedCamps));
    setCamps(updatedCamps.filter((camp: Camp) => 
      camp.userEmail === currentUser?.email || (camp.sharedWith || []).includes(currentUser?.email || '')
    ));
    setShowEditModal(false);
    setSelectedCamp(null);
  };

  const handleDeleteCamp = () => {
    if (!selectedCamp) return;

    const allCamps = JSON.parse(localStorage.getItem('camps') || '[]');
    const updatedCamps = allCamps.filter((camp: Camp) => camp.id !== selectedCamp.id);
    localStorage.setItem('camps', JSON.stringify(updatedCamps));
    setCamps(updatedCamps.filter((camp: Camp) => 
      camp.userEmail === currentUser?.email || (camp.sharedWith || []).includes(currentUser?.email || '')
    ));
    setShowDeleteModal(false);
    setSelectedCamp(null);
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
            <div className="flex space-x-4">
              <button
                onClick={() => setShowJoinModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Mevcut Kamp Ekle
              </button>
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
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {camps.map((camp) => (
            <div
              key={camp.id}
              className="bg-white/90 backdrop-blur-sm overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{camp.name}</h3>
                  <div className="flex space-x-2">
                    {camp.userEmail === currentUser?.email && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCamp(camp);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCamp(camp);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCamp(camp);
                        setShowCodeModal(true);
                      }}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                {camp.description && (
                  <p className="text-gray-600 mb-4">{camp.description}</p>
                )}
                <div 
                  onClick={() => handleCampClick(camp)}
                  className="mt-4 flex justify-end cursor-pointer"
                >
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

      {/* Düzenleme Modalı */}
      {showEditModal && selectedCamp && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Kampı Düzenle</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="editCampName" className="block text-sm font-medium text-gray-700 mb-2">
                  Kamp Adı
                </label>
                <input
                  type="text"
                  id="editCampName"
                  value={selectedCamp.name}
                  onChange={(e) => setSelectedCamp({ ...selectedCamp, name: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                  placeholder="Kampın adını girin"
                />
              </div>
              <div>
                <label htmlFor="editCampDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama (İsteğe bağlı)
                </label>
                <textarea
                  id="editCampDescription"
                  value={selectedCamp.description}
                  onChange={(e) => setSelectedCamp({ ...selectedCamp, description: e.target.value })}
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                  placeholder="Kamp hakkında kısa bir açıklama yazın"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCamp(null);
                }}
                className="px-6 py-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                İptal
              </button>
              <button
                onClick={handleEditCamp}
                className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {showDeleteModal && selectedCamp && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Kampı Sil</h3>
            <p className="text-gray-600 mb-6">
              &quot;{selectedCamp.name}&quot; kampını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCamp(null);
                }}
                className="px-6 py-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteCamp}
                className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {showCodeModal && selectedCamp && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Kamp Kodu</h3>
            <p className="text-gray-600 mb-4">
              Bu kamp kodunu başka kullanıcılarla paylaşarak onların da bu kampa erişmesini sağlayabilirsiniz:
            </p>
            <div className="flex items-center justify-between bg-gray-100 rounded-lg p-4 mb-6">
              <span className="font-mono text-lg font-semibold select-all">{selectedCamp?.code || 'Kod bulunamadı'}</span>
              <button
                onClick={() => {
                  if (selectedCamp?.code) {
                    navigator.clipboard.writeText(selectedCamp.code);
                    alert('Kamp kodu kopyalandı!');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Kodu Kopyala"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setSelectedCamp(null);
                }}
                className="px-6 py-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Mevcut Kampa Katıl</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="joinCampCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Kamp Kodu
                </label>
                <input
                  type="text"
                  id="joinCampCode"
                  value={joinCampCode}
                  onChange={(e) => setJoinCampCode(e.target.value.toUpperCase())}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                  placeholder="Kamp kodunu girin"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCampCode('');
                }}
                className="px-6 py-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                İptal
              </button>
              <button
                onClick={handleJoinCamp}
                className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                Katıl
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 