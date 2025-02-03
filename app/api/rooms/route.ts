import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Oda listesini getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campId = searchParams.get('campId');

    if (!campId) {
      return NextResponse.json(
        { error: 'Kamp ID\'si gereklidir' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'data', 'rooms.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const roomsData = JSON.parse(fileContent);

    // Belirli bir kampa ait odaları filtrele
    const campRooms = roomsData.rooms.filter((room: any) => room.campId === campId);

    return NextResponse.json({ rooms: campRooms });
  } catch (error) {
    console.error('Oda listesi getirme hatası:', error);
    return NextResponse.json(
      { error: 'Odalar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni oda ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campId, number, capacity, project } = body;

    if (!campId || !number || !capacity) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'data', 'rooms.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const roomsData = JSON.parse(fileContent);

    // Aynı numaralı oda var mı kontrol et
    const existingRoom = roomsData.rooms.find(
      (r: any) => r.campId === campId && r.number === number
    );

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Bu oda numarası zaten kullanılıyor' },
        { status: 400 }
      );
    }

    const newRoom = {
      id: Date.now().toString(),
      campId,
      number,
      capacity,
      project,
      workers: [],
      createdAt: new Date().toISOString()
    };

    roomsData.rooms.push(newRoom);
    await fs.writeFile(filePath, JSON.stringify(roomsData, null, 2));

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('Oda ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Oda eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Odayı güncelle
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, number, capacity, project, workers } = body;

    if (!id || !number || !capacity) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'data', 'rooms.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const roomsData = JSON.parse(fileContent);

    const roomIndex = roomsData.rooms.findIndex((r: any) => r.id === id);
    if (roomIndex === -1) {
      return NextResponse.json(
        { error: 'Oda bulunamadı' },
        { status: 404 }
      );
    }

    const updatedRoom = {
      ...roomsData.rooms[roomIndex],
      number,
      capacity,
      project,
      workers: workers || roomsData.rooms[roomIndex].workers,
      updatedAt: new Date().toISOString()
    };

    roomsData.rooms[roomIndex] = updatedRoom;
    await fs.writeFile(filePath, JSON.stringify(roomsData, null, 2));

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('Oda güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Oda güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Odayı sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Oda ID\'si gereklidir' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'data', 'rooms.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const roomsData = JSON.parse(fileContent);

    const roomIndex = roomsData.rooms.findIndex((r: any) => r.id === id);
    if (roomIndex === -1) {
      return NextResponse.json(
        { error: 'Oda bulunamadı' },
        { status: 404 }
      );
    }

    roomsData.rooms.splice(roomIndex, 1);
    await fs.writeFile(filePath, JSON.stringify(roomsData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Oda silme hatası:', error);
    return NextResponse.json(
      { error: 'Oda silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 