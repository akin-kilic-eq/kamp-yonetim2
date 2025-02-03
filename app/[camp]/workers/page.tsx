'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Room, Worker } from '../types';

export default function WorkersPage() {
  const params = useParams();
  const router = useRouter();
  
  // State tanımlamaları
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [currentCamp, setCurrentCamp] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangeRoomModal, setShowChangeRoomModal] = useState(false);
  
  // Form states
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newWorker, setNewWorker] = useState({
    name: '',
    registrationNumber: '',
    project: '',
    entryDate: new Date().toISOString().split('T')[0]
  });

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const sortData = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    const sortedData = [...filteredWorkers].sort((a, b) => {
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      
      if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setFilteredWorkers(sortedData);
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    // Oturum kontrolü
    const userSession = sessionStorage.getItem('currentUser');
    if (!userSession) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userSession);
    setCurrentUser(user);

    // Mevcut kampı kontrol et
    const currentCampData = localStorage.getItem('currentCamp');
    if (!currentCampData) {
      router.push('/camps');
      return;
    }

    const camp = JSON.parse(currentCampData);
    
    // Erişim kontrolü - hem kamp sahibi hem de paylaşılan kullanıcılar erişebilir
    const hasAccess = camp.userEmail === user.email || (camp.sharedWith || []).includes(user.email);
    if (!hasAccess) {
      router.push('/camps');
      return;
    }

    setCurrentCamp(camp);

    // Odaları yükle
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const campRooms = allRooms.filter((room: Room) => room.campId === camp.id);
    setRooms(campRooms);

    // İşçileri yükle
    const workersWithRoomInfo = campRooms.flatMap((room: Room) => 
      (room.workers || []).map((worker: Worker) => ({
        ...worker,
        roomNumber: room.number,
        roomId: room.id
      }))
    );

    setWorkers(workersWithRoomInfo);
    setFilteredWorkers(workersWithRoomInfo);
  }, [router]);

  // Arama fonksiyonu
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredWorkers(workers);
    } else {
      const filtered = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWorkers(filtered);
    }
  }, [searchTerm, workers]);

  const handleAddWorker = () => {
    if (!newWorker.name || !newWorker.registrationNumber || !newWorker.project || !selectedRoom) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    const selectedRoomData = rooms.find(room => room.id === selectedRoom.id);
    if (!selectedRoomData) {
      alert('Oda bulunamadı');
      return;
    }

    // Boş yatak kontrolü
    const availableBeds = selectedRoomData.capacity - selectedRoomData.workers.length;
    if (availableBeds <= 0) {
      alert('Seçilen odada boş yatak bulunmamaktadır');
      return;
    }

    const workerData: Worker = {
      id: Date.now().toString(),
      ...newWorker,
      roomId: selectedRoom.id
    };

    // Odaları güncelle
    const updatedRooms = rooms.map(room => {
      if (room.id === selectedRoom.id) {
        return {
          ...room,
          workers: [...room.workers, workerData]
        };
      }
      return room;
    });

    // Local storage güncelle
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const otherRooms = allRooms.filter((room: Room) => room.campId !== currentCamp.id);
    localStorage.setItem('rooms', JSON.stringify([...otherRooms, ...updatedRooms]));

    // State'leri güncelle
    setRooms(updatedRooms);
    const newWorkers = updatedRooms.flatMap(room => room.workers);
    setWorkers(newWorkers);
    setFilteredWorkers(newWorkers);

    // Modalı kapat ve formu temizle
    setShowAddModal(false);
    setNewWorker({
      name: '',
      registrationNumber: '',
      project: '',
      entryDate: new Date().toISOString().split('T')[0]
    });
    setSelectedRoom(null);
  };

  const handleUpdateWorker = (worker: Worker) => {
    if (!worker || !worker.name || !worker.registrationNumber || !worker.project) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    // Odaları güncelle
    const updatedRooms = rooms.map(room => {
      if (room.workers.some(w => w.id === worker.id)) {
        return {
          ...room,
          workers: room.workers.map(w => 
            w.id === worker.id ? worker : w
          )
        };
      }
      return room;
    });

    // Local storage güncelle
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const otherRooms = allRooms.filter((room: Room) => room.campId !== currentCamp.id);
    localStorage.setItem('rooms', JSON.stringify([...otherRooms, ...updatedRooms]));

    // State'leri güncelle
    setRooms(updatedRooms);
    const updatedWorkers = updatedRooms.flatMap(room => room.workers);
    setWorkers(updatedWorkers);
    setFilteredWorkers(updatedWorkers);

    // Modalı kapat
    setShowEditModal(false);
    setSelectedWorker(null);
  };

  const handleDeleteWorker = (worker: Worker) => {
    if (!worker || !worker.roomId) return;

    // Odaları güncelle
    const updatedRooms = rooms.map(room => {
      if (room.id === worker.roomId) {
        return {
          ...room,
          workers: room.workers.filter(w => w.id !== worker.id)
        };
      }
      return room;
    });

    // Local storage güncelle
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const otherRooms = allRooms.filter((room: Room) => room.campId !== currentCamp.id);
    localStorage.setItem('rooms', JSON.stringify([...otherRooms, ...updatedRooms]));

    // State'leri güncelle
    setRooms(updatedRooms);
    const remainingWorkers = updatedRooms.flatMap(room => 
      room.workers.map(w => ({
        ...w,
        roomNumber: room.number,
        roomId: room.id
      }))
    );
    setWorkers(remainingWorkers);
    setFilteredWorkers(remainingWorkers);

    // Modalı kapat
    setShowDeleteModal(false);
    setSelectedWorker(null);
  };

  const handleChangeRoom = (worker: Worker, newRoom: Room | null) => {
    if (!worker || !worker.roomId || !newRoom) return;

    // Eski ve yeni odaları bul
    const currentRoom = rooms.find(room => room.id === worker.roomId);
    const targetRoom = rooms.find(room => room.id === newRoom.id);

    if (!currentRoom || !targetRoom) return;

    // Boş yatak kontrolü
    const availableBeds = targetRoom.capacity - targetRoom.workers.length;
    if (availableBeds <= 0) {
      alert('Seçilen odada boş yatak bulunmamaktadır');
      return;
    }

    // Odaları güncelle
    const updatedRooms = rooms.map(room => {
      if (room.id === currentRoom.id) {
        // Eski odadan işçiyi çıkar
        return {
          ...room,
          workers: room.workers.filter(w => w.id !== worker.id)
        };
      }
      if (room.id === targetRoom.id) {
        // Yeni odaya işçiyi ekle
        const updatedWorker = {
          ...worker,
          roomId: room.id,
          roomNumber: room.number,
          entryDate: new Date().toISOString().split('T')[0]
        };
        return {
          ...room,
          workers: [...room.workers, updatedWorker]
        };
      }
      return room;
    });

    // Local storage güncelle
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const otherRooms = allRooms.filter((room: Room) => room.campId !== currentCamp.id);
    localStorage.setItem('rooms', JSON.stringify([...otherRooms, ...updatedRooms]));

    // State'leri güncelle
    setRooms(updatedRooms);
    const updatedWorkers = updatedRooms.flatMap(room => 
      room.workers.map(w => ({
        ...w,
        roomNumber: room.number,
        roomId: room.id
      }))
    );
    setWorkers(updatedWorkers);
    setFilteredWorkers(updatedWorkers);

    // Modalı kapat
    setShowChangeRoomModal(false);
    setSelectedRoom(null);
    setSelectedWorker(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">İşçi Yönetimi</h1>
            <p className="mt-2 text-sm text-gray-600">Kamptaki tüm işçilerin listesi ve detayları</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Yeni İşçi Ekle
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İsim veya sicil numarasına göre ara..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-10 py-2"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => sortData('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>İsim</span>
                    <div className="flex flex-col">
                      <svg className={`w-3 h-3 ${sortConfig?.key === 'name' && sortConfig.direction === 'ascending' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <svg className={`w-3 h-3 ${sortConfig?.key === 'name' && sortConfig.direction === 'descending' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => sortData('registrationNumber')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Sicil No</span>
                    <div className="flex flex-col">
                      <svg className={`w-3 h-3 ${sortConfig?.key === 'registrationNumber' && sortConfig.direction === 'ascending' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <svg className={`w-3 h-3 ${sortConfig?.key === 'registrationNumber' && sortConfig.direction === 'descending' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => sortData('project')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Proje</span>
                    <div className="flex flex-col">
                      <svg className={`w-3 h-3 ${sortConfig?.key === 'project' && sortConfig.direction === 'ascending' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <svg className={`w-3 h-3 ${sortConfig?.key === 'project' && sortConfig.direction === 'descending' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => sortData('entryDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Giriş Tarihi</span>
                    <div className="flex flex-col">
                      <svg className={`w-3 h-3 ${sortConfig?.key === 'entryDate' && sortConfig.direction === 'ascending' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <svg className={`w-3 h-3 ${sortConfig?.key === 'entryDate' && sortConfig.direction === 'descending' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => sortData('roomNumber')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Oda</span>
                    <div className="flex flex-col">
                      <svg className={`w-3 h-3 ${sortConfig?.key === 'roomNumber' && sortConfig.direction === 'ascending' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <svg className={`w-3 h-3 ${sortConfig?.key === 'roomNumber' && sortConfig.direction === 'descending' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWorkers.map((worker) => {
                const workerRoom = rooms.find(room => room.workers.some(w => w.id === worker.id));
                return (
                  <tr key={worker.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{worker.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{worker.registrationNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{worker.project}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{worker.entryDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workerRoom?.number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedWorker(worker);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWorker(worker);
                            setShowChangeRoomModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Oda Değiştir
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWorker(worker);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni İşçi Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni İşçi Ekle</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="name"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                  Sicil No
                </label>
                <input
                  type="text"
                  id="registrationNumber"
                  value={newWorker.registrationNumber}
                  onChange={(e) => setNewWorker({ ...newWorker, registrationNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                  Şantiye
                </label>
                <select
                  id="project"
                  value={newWorker.project}
                  onChange={(e) => setNewWorker({ ...newWorker, project: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Seçiniz</option>
                  <option value="Slava 4">Slava 4</option>
                  <option value="Slava 2-3">Slava 2-3</option>
                </select>
              </div>
              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-700">
                  Oda
                </label>
                <select
                  id="room"
                  value={selectedRoom?.id}
                  onChange={(e) => setSelectedRoom(rooms.find(room => room.id === e.target.value) || null)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Oda Seçin</option>
                  {rooms
                    .filter(room => {
                      const availableBeds = room.capacity - room.workers.length;
                      return availableBeds > 0;
                    })
                    .map(room => {
                      const availableBeds = room.capacity - room.workers.length;
                      return (
                        <option key={room.id} value={room.id}>
                          Oda {room.number} ({availableBeds} Boş Yatak)
                        </option>
                      );
                    })}
                </select>
              </div>
              <div>
                <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700">
                  Odaya Giriş Tarihi
                </label>
                <input
                  type="date"
                  id="entryDate"
                  value={newWorker.entryDate}
                  onChange={(e) => setNewWorker({ ...newWorker, entryDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewWorker({
                    name: '',
                    registrationNumber: '',
                    project: '',
                    entryDate: new Date().toISOString().split('T')[0]
                  });
                  setSelectedRoom(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleAddWorker}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İşçi Düzenleme Modalı */}
      {showEditModal && selectedWorker && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">İşçi Düzenle</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="editName"
                  value={selectedWorker.name}
                  onChange={(e) => setSelectedWorker({ ...selectedWorker, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="editRegistrationNumber" className="block text-sm font-medium text-gray-700">
                  Sicil No
                </label>
                <input
                  type="text"
                  id="editRegistrationNumber"
                  value={selectedWorker.registrationNumber}
                  onChange={(e) => setSelectedWorker({ ...selectedWorker, registrationNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="editProject" className="block text-sm font-medium text-gray-700">
                  Şantiye
                </label>
                <select
                  id="editProject"
                  value={selectedWorker.project}
                  onChange={(e) => setSelectedWorker({ ...selectedWorker, project: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Seçiniz</option>
                  <option value="Slava 4">Slava 4</option>
                  <option value="Slava 2-3">Slava 2-3</option>
                </select>
              </div>
              <div>
                <label htmlFor="editEntryDate" className="block text-sm font-medium text-gray-700">
                  Odaya Giriş Tarihi
                </label>
                <input
                  type="date"
                  id="editEntryDate"
                  value={selectedWorker.entryDate}
                  onChange={(e) => setSelectedWorker({ ...selectedWorker, entryDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedWorker(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleUpdateWorker(selectedWorker)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İşçi Silme Modalı */}
      {showDeleteModal && selectedWorker && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">İşçi Sil</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedWorker.name} isimli işçiyi silmek istediğinize emin misiniz?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedWorker(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleDeleteWorker(selectedWorker)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Oda Değiştirme Modalı */}
      {showChangeRoomModal && selectedWorker && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Oda Değiştir</h3>
            <p className="text-sm text-gray-600 mb-2">
              {selectedWorker.name} isimli işçinin;
            </p>
            {/* Mevcut oda bilgisi */}
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <p className="text-sm font-medium text-gray-700">
                Mevcut Odası: {rooms.find(room => room.workers.some(w => w.id === selectedWorker.id))?.number || '-'}
              </p>
            </div>
            <div className="mb-4">
              <label htmlFor="newRoom" className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Oda Seç
              </label>
              <select
                id="newRoom"
                value={selectedRoom?.id}
                onChange={(e) => setSelectedRoom(rooms.find(room => room.id === e.target.value) || null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Oda Seçin</option>
                {rooms
                  .filter(room => {
                    const isCurrentRoom = room.workers.some(w => w.id === selectedWorker.id);
                    const availableBeds = room.capacity - room.workers.length;
                    return !isCurrentRoom && availableBeds > 0;
                  })
                  .map(room => {
                    const availableBeds = room.capacity - room.workers.length;
                    return (
                      <option key={room.id} value={room.id}>
                        Oda {room.number} ({availableBeds} Boş Yatak)
                      </option>
                    );
                  })}
              </select>
              {rooms.filter(room => {
                const isCurrentRoom = room.workers.some(w => w.id === selectedWorker.id);
                return !isCurrentRoom && room.availableBeds > 0;
              }).length === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  Şu anda boş yatak bulunan oda bulunmamaktadır.
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowChangeRoomModal(false);
                  setSelectedRoom(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleChangeRoom(selectedWorker, selectedRoom)}
                disabled={!selectedRoom}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md ${
                  selectedRoom ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Değiştir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 