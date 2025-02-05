import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface User {
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Gerekli alanları kontrol et
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('kamp-yonetim');

    // E-posta adresi kontrolü
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Yeni kullanıcıyı ekle
    const newUser: User = {
      email,
      password,
      name,
      createdAt: new Date().toISOString()
    };

    await db.collection('users').insertOne(newUser);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 