import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Kamp listesini getir
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'camps.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const campsData = JSON.parse(fileContent);

    return NextResponse.json(campsData);
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

    const filePath = path.join(process.cwd(), 'data', 'camps.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const campsData = JSON.parse(fileContent);

    const newCamp = {
      id: Date.now().toString(),
      name,
      startDate,
      endDate,
      createdAt: new Date().toISOString()
    };

    campsData.camps.push(newCamp);
    await fs.writeFile(filePath, JSON.stringify(campsData, null, 2));

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

    const filePath = path.join(process.cwd(), 'data', 'camps.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const campsData = JSON.parse(fileContent);

    const campIndex = campsData.camps.findIndex((c: any) => c.id === id);
    if (campIndex === -1) {
      return NextResponse.json(
        { error: 'Kamp bulunamadı' },
        { status: 404 }
      );
    }

    const updatedCamp = {
      ...campsData.camps[campIndex],
      name,
      startDate,
      endDate,
      updatedAt: new Date().toISOString()
    };

    campsData.camps[campIndex] = updatedCamp;
    await fs.writeFile(filePath, JSON.stringify(campsData, null, 2));

    return NextResponse.json(updatedCamp);
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

    const filePath = path.join(process.cwd(), 'data', 'camps.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const campsData = JSON.parse(fileContent);

    const campIndex = campsData.camps.findIndex((c: any) => c.id === id);
    if (campIndex === -1) {
      return NextResponse.json(
        { error: 'Kamp bulunamadı' },
        { status: 404 }
      );
    }

    campsData.camps.splice(campIndex, 1);
    await fs.writeFile(filePath, JSON.stringify(campsData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kamp silme hatası:', error);
    return NextResponse.json(
      { error: 'Kamp silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 