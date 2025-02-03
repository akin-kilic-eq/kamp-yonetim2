import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Kamp listesini getir
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('kamp-yonetim');
    const camps = await db.collection('camps').find({}).toArray();

    return NextResponse.json({ camps });
  } catch (error) {
    console.error('Kamp listesi getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kamplar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni kamp ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, startDate, endDate } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('kamp-yonetim');

    const newCamp = {
      name,
      startDate,
      endDate,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('camps').insertOne(newCamp);
    newCamp._id = result.insertedId;

    return NextResponse.json(newCamp, { status: 201 });
  } catch (error) {
    console.error('Kamp ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Kamp eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kampı güncelle
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, startDate, endDate } = body;

    if (!id || !name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('kamp-yonetim');

    const updatedCamp = {
      name,
      startDate,
      endDate,
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('camps').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedCamp }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Kamp bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...updatedCamp, _id: id });
  } catch (error) {
    console.error('Kamp güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kamp güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kampı sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Kamp ID\'si gereklidir' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('kamp-yonetim');

    const result = await db.collection('camps').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Kamp bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kamp silme hatası:', error);
    return NextResponse.json(
      { error: 'Kamp silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 