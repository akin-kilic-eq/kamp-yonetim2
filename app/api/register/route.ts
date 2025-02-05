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

    console.log('MongoDB bağlantısı kuruluyor...');
    const client = await clientPromise;
    console.log('MongoDB bağlantısı başarılı');

    const db = client.db('kamp-yonetim');
    console.log('Veritabanı seçildi:', db.databaseName);

    // E-posta adresi kontrolü
    console.log('E-posta kontrolü yapılıyor:', email);
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      console.log('E-posta adresi zaten kullanımda');
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

    console.log('Yeni kullanıcı ekleniyor:', { ...newUser, password: '***' });
    const result = await db.collection('users').insertOne(newUser);
    console.log('Kullanıcı eklendi, ID:', result.insertedId);

    return NextResponse.json({ 
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      userId: result.insertedId.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Kayıt hatası detayı:', error);
    // Hata detayını da döndür
    return NextResponse.json(
      { 
        error: 'Kayıt sırasında bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 