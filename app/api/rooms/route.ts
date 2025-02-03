import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface Room {
  _id?: ObjectId;
  campId: string;
  number: string;
  capacity: number;
  project?: string;
  workers: string[];
  createdAt: string;
  updatedAt?: string;
}

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

    const client = await clientPromise;
    const db = client.db('kamp-yonetim');

    // Belirli bir kampa ait odaları filtrele
    const rooms = await db.collection('rooms')
      .find({ campId: campId })
      .toArray();

    // ObjectId'leri string'e çevir
    const formattedRooms = rooms.map(room => ({
      ...room,
      _id: room._id.toString()
    }));

    return NextResponse.json({ rooms: formattedRooms });
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

    const client = await clientPromise;
    const db = client.db('kamp-yonetim');

    // Aynı numaralı oda var mı kontrol et
    const existingRoom = await db.collection('rooms').findOne({
      campId,
      number
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Bu oda numarası zaten kullanılıyor' },
        { status: 400 }
      );
    }

    const newRoom: Room = {
      campId,
      number,
      capacity,
      project,
      workers: [],
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('rooms').insertOne(newRoom);
    
    return NextResponse.json({ 
      ...newRoom, 
      _id: result.insertedId.toString() 
    }, { status: 201 });
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

    const client = await clientPromise;
    const db = client.db('kamp-yonetim');

    const updatedRoom: Partial<Room> = {
      number,
      capacity,
      project,
      workers: workers || [],
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('rooms').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedRoom },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return NextResponse.json(
        { error: 'Oda bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result.value,
      _id: result.value._id.toString()
    });
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

    const client = await clientPromise;
    const db = client.db('kamp-yonetim');

    const result = await db.collection('rooms').findOneAndDelete({
      _id: new ObjectId(id)
    });

    if (!result.value) {
      return NextResponse.json(
        { error: 'Oda bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Oda silme hatası:', error);
    return NextResponse.json(
      { error: 'Oda silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 