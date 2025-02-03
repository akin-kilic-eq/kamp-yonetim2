import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

    return NextResponse.json({ rooms });
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

    const newRoom = {
      campId,
      number,
      capacity,
      project,
      workers: [],
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('rooms').insertOne(newRoom);
    newRoom._id = result.insertedId;

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

    const client = await clientPromise;
    const db = client.db('kamp-yonetim');

    const updatedRoom = {
      number,
      capacity,
      project,
      workers: workers || [],
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('rooms').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedRoom }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Oda bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...updatedRoom, _id: id });
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

    const result = await db.collection('rooms').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
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