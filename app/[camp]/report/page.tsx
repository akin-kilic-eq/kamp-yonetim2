'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Worker {
  id: string;
  name: string;
  registrationNumber: string;
  project: string;
  entryDate: string;
}

interface Room {
  id: string;
  campId: string;
  number: string;
  capacity: number;
  project: string;
  workers: Worker[];
  availableBeds: number;
}

interface Stats {
  totalRooms: number;
  totalCapacity: number;
  occupiedBeds: number;
  availableBeds: number;
  totalWorkers: number;
  occupancyRate: number;
  slava4Rooms: number;
  slava23Rooms: number;
  slava4Workers: number;
  slava23Workers: number;
  averageOccupancyPerRoom: number;
  mostOccupiedRoom: string;
  leastOccupiedRoom: string;
  recentWorkers: number;
  projectDistribution: {
    [key: string]: {
      rooms: number;
      workers: number;
      occupancyRate: number;
    };
  };
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    totalCapacity: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    totalWorkers: 0,
    occupancyRate: 0,
    slava4Rooms: 0,
    slava23Rooms: 0,
    slava4Workers: 0,
    slava23Workers: 0,
    averageOccupancyPerRoom: 0,
    mostOccupiedRoom: '',
    leastOccupiedRoom: '',
    recentWorkers: 0,
    projectDistribution: {}
  });
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);

  useEffect(() => {
    // Oturum kontrolü
    const userSession = sessionStorage.getItem('currentUser');
    if (!userSession) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userSession);

    // Kampları yükle ve kullanıcının kampını bul
    const camps = JSON.parse(localStorage.getItem('camps') || '[]');
    const currentCamp = camps.find((camp: any) => 
      camp.name.toLowerCase().replace(/\s+/g, '') === params.camp && 
      camp.userEmail === user.email
    );

    if (!currentCamp) {
      router.push('/camps');
      return;
    }

    // Odaları yükle
    const allRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const campRooms = allRooms.filter((room: any) => room.campId === currentCamp.id);
    setRooms(campRooms);

    // Temel istatistikler
    const totalRooms = campRooms.length;
    const totalCapacity = campRooms.reduce((sum: number, room: Room) => sum + room.capacity, 0);
    const occupiedBeds = campRooms.reduce((sum: number, room: Room) => sum + room.workers.length, 0);
    const availableBeds = totalCapacity - occupiedBeds;
    const totalWorkers = occupiedBeds;
    const occupancyRate = totalCapacity > 0 ? (occupiedBeds / totalCapacity) * 100 : 0;

    // Proje bazlı istatistikler
    const projectDistribution: { [key: string]: { rooms: number; workers: number; occupancyRate: number } } = {};
    const projects = ['Slava 4', 'Slava 2-3'];

    projects.forEach(project => {
      const projectRooms = campRooms.filter(room => room.project === project);
      const roomCount = projectRooms.length;
      const workerCount = projectRooms.reduce((sum, room) => sum + room.workers.length, 0);
      const totalProjectCapacity = projectRooms.reduce((sum, room) => sum + room.capacity, 0);
      const projectOccupancyRate = totalProjectCapacity > 0 ? (workerCount / totalProjectCapacity) * 100 : 0;

      projectDistribution[project] = {
        rooms: roomCount,
        workers: workerCount,
        occupancyRate: projectOccupancyRate
      };
    });

    // Detaylı istatistikler
    const roomOccupancyRates = campRooms.map(room => ({
      number: room.number,
      occupancyRate: (room.workers.length / room.capacity) * 100
    }));

    const mostOccupiedRoom = roomOccupancyRates.length > 0 
      ? roomOccupancyRates.reduce((prev, current) => 
          prev.occupancyRate > current.occupancyRate ? prev : current
        ).number
      : '';

    const leastOccupiedRoom = roomOccupancyRates.length > 0
      ? roomOccupancyRates.reduce((prev, current) => 
          prev.occupancyRate < current.occupancyRate ? prev : current
        ).number
      : '';

    const averageOccupancyPerRoom = totalRooms > 0 ? occupiedBeds / totalRooms : 0;

    // Son 7 gün içinde giriş yapan işçi sayısı
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentWorkers = campRooms.reduce((sum, room) => 
      sum + room.workers.filter(worker => 
        new Date(worker.entryDate) >= oneWeekAgo
      ).length, 0);

    setStats({
      totalRooms,
      totalCapacity,
      occupiedBeds,
      availableBeds,
      totalWorkers,
      occupancyRate,
      slava4Rooms: projectDistribution['Slava 4'].rooms,
      slava23Rooms: projectDistribution['Slava 2-3'].rooms,
      slava4Workers: projectDistribution['Slava 4'].workers,
      slava23Workers: projectDistribution['Slava 2-3'].workers,
      averageOccupancyPerRoom,
      mostOccupiedRoom,
      leastOccupiedRoom,
      recentWorkers,
      projectDistribution
    });
  }, [params.camp, router]);

  const handleProjectClick = (project: string) => {
    const projectRooms = rooms.filter(room => room.project === project);
    setSelectedRooms(projectRooms);
    setSelectedProject(project);
    setShowRoomModal(true);
  };

  const pieData = {
    labels: ['Dolu Yatak', 'Boş Yatak'],
    datasets: [
      {
        data: [stats.occupiedBeds, stats.availableBeds],
        backgroundColor: ['#F87171', '#34D399'],
        borderColor: ['#F87171', '#34D399'],
        borderWidth: 2
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20
        }
      }
    },
    cutout: '50%'
  };

  const barData = {
    labels: ['Slava 4', 'Slava 2-3'],
    datasets: [
      {
        label: 'İşçi Sayısı',
        data: [stats.slava4Workers, stats.slava23Workers],
        backgroundColor: ['#60A5FA', '#818CF8'],
        borderRadius: 4,
        barThickness: 40
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[url('/arka-plan-guncel-2.jpg')] bg-cover bg-center bg-fixed">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Genel İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Toplam Kapasite</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalCapacity}</p>
            <p className="text-sm text-gray-500 mt-2">Yatak</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Doluluk Oranı</h3>
            <p className="text-3xl font-bold text-green-600">%{stats.occupancyRate.toFixed(1)}</p>
            <p className="text-sm text-gray-500 mt-2">Ortalama</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Toplam İşçi</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalWorkers}</p>
            <p className="text-sm text-gray-500 mt-2">Kişi</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni İşçiler</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.recentWorkers}</p>
            <p className="text-sm text-gray-500 mt-2">Son 7 gün</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Yatak Durumu */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Yatak Durumu</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-64">
                <Pie data={pieData} options={pieOptions} />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-700">Dolu Yatak</p>
                  <p className="text-2xl font-semibold text-red-900">{stats.occupiedBeds}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-700">Boş Yatak</p>
                  <p className="text-2xl font-semibold text-green-900">{stats.availableBeds}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Şantiye Bazlı İşçi Dağılımı */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Şantiye Bazlı İşçi Dağılımı</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-64">
                <Bar data={barData} options={barOptions} />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">Slava 4</p>
                  <p className="text-2xl font-semibold text-blue-900">{stats.slava4Workers}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm font-medium text-indigo-700">Slava 2-3</p>
                  <p className="text-2xl font-semibold text-indigo-900">{stats.slava23Workers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detaylı İstatistikler */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Şantiye Bazlı Oda Dağılımı */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Şantiye Bazlı Oda Dağılımı</h2>
            <div className="space-y-6">
              <div 
                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => handleProjectClick('Slava 4')}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-white">Slava 4</h3>
                    <p className="text-sm text-blue-100">Toplam {stats.slava4Rooms} Oda</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {stats.projectDistribution['Slava 4']?.occupancyRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-blue-100">Doluluk</p>
                  </div>
                </div>
              </div>

              <div 
                className="p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => handleProjectClick('Slava 2-3')}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-white">Slava 2-3</h3>
                    <p className="text-sm text-indigo-100">Toplam {stats.slava23Rooms} Oda</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {stats.projectDistribution['Slava 2-3']?.occupancyRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-indigo-100">Doluluk</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Oda İstatistikleri */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Oda İstatistikleri</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-700">Ortalama Doluluk</p>
                  <p className="text-2xl font-semibold text-purple-900">
                    {stats.averageOccupancyPerRoom.toFixed(1)}
                  </p>
                  <p className="text-sm text-purple-600">Kişi/Oda</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-700">Toplam Oda</p>
                  <p className="text-2xl font-semibold text-orange-900">{stats.totalRooms}</p>
                  <p className="text-sm text-orange-600">Adet</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">En Dolu Oda</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.mostOccupiedRoom}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">En Boş Oda</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.leastOccupiedRoom}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Oda Detayları Modalı */}
      {showRoomModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{selectedProject} Odaları</h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oda No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kapasite
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doluluk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doluluk Oranı
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedRooms.map((room) => (
                    <tr key={room.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {room.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.workers.length}/{room.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        %{((room.workers.length / room.capacity) * 100).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Toplam
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {selectedRooms.reduce((sum, room) => sum + room.capacity, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {selectedRooms.reduce((sum, room) => sum + room.workers.length, 0)}/
                      {selectedRooms.reduce((sum, room) => sum + room.capacity, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      %{(selectedRooms.reduce((sum, room) => sum + room.workers.length, 0) / 
                         selectedRooms.reduce((sum, room) => sum + room.capacity, 0) * 100).toFixed(1)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 