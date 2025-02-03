'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [newCamp, setNewCamp] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const savedCamps = localStorage.getItem('camps');
    if (savedCamps) {
      setCamps(JSON.parse(savedCamps));
    }
  }, []);

  // Yeni kamp ekleme fonksiyonu
  const handleAddCamp = () => {
    if (!newCamp.name) {
      alert('Lütfen kamp adını giriniz');
      return;
    }

    const newCampData: Camp = {
      id: Date.now().toString(),
      name: newCamp.name,
      description: newCamp.description,
      userEmail: 'user@example.com' // Bu kısmı gerçek kullanıcı emaili ile değiştirin
    };

    const updatedCamps = [...camps, newCampData];
    localStorage.setItem('camps', JSON.stringify(updatedCamps));
    setCamps(updatedCamps);
    setShowAddModal(false);
    setNewCamp({ name: '', description: '' });
  };

  // Kamp düzenleme fonksiyonu
  const handleEditCamp = () => {
    if (!selectedCamp || !selectedCamp.name) {
      alert('Lütfen kamp adını giriniz');
      return;
    }

    const updatedCamps = camps.map(camp => 
      camp.id === selectedCamp.id ? selectedCamp : camp
    );

    localStorage.setItem('camps', JSON.stringify(updatedCamps));
    setCamps(updatedCamps);
    setShowEditModal(false);
    setSelectedCamp(null);
  };

  // Kamp silme fonksiyonu
  const handleDeleteCamp = () => {
    if (!selectedCamp) return;

    const updatedCamps = camps.filter(camp => camp.id !== selectedCamp.id);
    localStorage.setItem('camps', JSON.stringify(updatedCamps));
    setCamps(updatedCamps);
    setShowDeleteModal(false);
    setSelectedCamp(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Kamplarım</h1>
          <p className="text-gray-600 mt-1">Yönettiğiniz kampların listesi</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Yeni Kamp Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {camps.map((camp) => (
          <div key={camp.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">{camp.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCamp(camp);
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCamp(camp);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">{camp.description}</p>
              <button
                onClick={() => router.push(`/${camp.name.toLowerCase().replace(/\s+/g, '')}/dashboard`)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                Yönetim Paneline Git
                <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Yeni Kamp Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Kamp Ekle</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="campName" className="block text-sm font-medium text-gray-700">
                  Kamp Adı
                </label>
                <input
                  type="text"
                  id="campName"
                  value={newCamp.name}
                  onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="campDescription" className="block text-sm font-medium text-gray-700">
                  Açıklama
                </label>
                <textarea
                  id="campDescription"
                  value={newCamp.description}
                  onChange={(e) => setNewCamp({ ...newCamp, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCamp({ name: '', description: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleAddCamp}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kamp Düzenleme Modalı */}
      {showEditModal && selectedCamp && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kampı Düzenle</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700">
                  Kamp Adı
                </label>
                <input
                  type="text"
                  id="editName"
                  value={selectedCamp.name}
                  onChange={(e) => setSelectedCamp({ ...selectedCamp, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">
                  Açıklama
                </label>
                <textarea
                  id="editDescription"
                  value={selectedCamp.description}
                  onChange={(e) => setSelectedCamp({ ...selectedCamp, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCamp(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleEditCamp}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kamp Silme Onay Modalı */}
      {showDeleteModal && selectedCamp && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kamp Sil</h3>
            <div className="text-sm text-gray-500">
              &quot;{selectedCamp.name}&quot; kampını silmek istediğinize emin misiniz?
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCamp(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteCamp}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 