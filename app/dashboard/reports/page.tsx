'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Room {
  id: number;
  number: string;
  capacity: number;
  company: string;
  project: string;
  availableBeds: number;
  workers: Worker[];
}

interface Worker {
  id: number;
  name: string;
  surname: string;
  registrationNumber: string;
  project: string;
}

interface CampStats {
  name: string;
  totalRooms: number;
  totalCapacity: number;
  occupiedBeds: number;
  availableBeds: number;
  totalWorkers: number;
  occupancyRate: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [campStats, setCampStats] = useState<CampStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalRooms: 0,
    totalCapacity: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    occupancyRate: 0,
  });

  useEffect(() => {
    const savedRooms = localStorage.getItem('rooms');
    if (savedRooms) {
      const parsedRooms = JSON.parse(savedRooms);
      setRooms(parsedRooms);
      calculateStats(parsedRooms);
    }
  }, []);

  const calculateStats = (rooms: Room[]) => {
    // Kamp projelerini belirle
    const projects = ['Slava 4', 'Slava 2-3'];
    
    // Her kamp için istatistikleri hesapla
    const stats = projects.map(project => {
      const campRooms = rooms.filter(room => room.project === project.split(' ')[1]);
      const totalRooms = campRooms.length;
      const totalCapacity = campRooms.reduce((sum, room) => sum + room.capacity, 0);
      const availableBeds = campRooms.reduce((sum, room) => sum + room.availableBeds, 0);
      const occupiedBeds = totalCapacity - availableBeds;
      const totalWorkers = campRooms.reduce((sum, room) => sum + room.workers.length, 0);
      const occupancyRate = totalCapacity > 0 ? (occupiedBeds / totalCapacity) * 100 : 0;

      return {
        name: project,
        totalRooms,
        totalCapacity,
        occupiedBeds,
        availableBeds,
        totalWorkers,
        occupancyRate
      };
    });

    setCampStats(stats);

    // Genel istatistikleri hesapla
    const total = {
      totalRooms: rooms.length,
      totalCapacity: rooms.reduce((sum, room) => sum + room.capacity, 0),
      availableBeds: rooms.reduce((sum, room) => sum + room.availableBeds, 0),
      occupiedBeds: rooms.reduce((sum, room) => sum + (room.capacity - room.availableBeds), 0),
      occupancyRate: 0
    };
    total.occupancyRate = total.totalCapacity > 0 ? (total.occupiedBeds / total.totalCapacity) * 100 : 0;

    setTotalStats(total);
  };

  const handleLogout = () => {
    localStorage.removeItem('selectedCampId');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Üst Menü */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  src="/antteq-logo.png"
                  alt="ANTTEQ Logo"
                  className="h-8 w-auto"
                />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Ana Sayfa
                </Link>
                <Link
                  href="/dashboard/workers"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  İşçiler
                </Link>
                <Link
                  href="/dashboard/rooms"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Odalar
                </Link>
                <Link
                  href="/dashboard/reports"
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Raporlar
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Ana İçerik */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Genel İstatistikler */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Genel İstatistikler</h3>
            </div>
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">Toplam Oda</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalStats.totalRooms}</dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">Toplam Yatak</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalStats.totalCapacity}</dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">Dolu Yatak</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalStats.occupiedBeds}</dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">Boş Yatak</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalStats.availableBeds}</dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">Doluluk Oranı</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">%{totalStats.occupancyRate.toFixed(1)}</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Kamp Bazında İstatistikler */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Kamp Bazında İstatistikler</h3>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kamp
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oda Sayısı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toplam Yatak
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dolu Yatak
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Boş Yatak
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşçi Sayısı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doluluk Oranı
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campStats.map((stat) => (
                    <tr key={stat.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.totalRooms}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.totalCapacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.occupiedBeds}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.availableBeds}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.totalWorkers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        %{stat.occupancyRate.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 