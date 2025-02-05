import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Gerekli alanları kontrol et
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre zorunludur' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('kamp-yonetim');

    // Kullanıcıyı bul
    const user = await db.collection('users').findOne({
      email,
      password
    });

    if (!user) {
      return NextResponse.json(
        { error: 'E-posta adresi veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Hassas bilgileri çıkar
    const { password: _, ...safeUser } = user;

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 