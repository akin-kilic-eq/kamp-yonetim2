import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

    // users.json dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const usersData = JSON.parse(fileContent);

    // E-posta adresi kontrolü
    const existingUser = usersData.users.find((u: any) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Yeni kullanıcıyı ekle
    const newUser = { email, password, name };
    usersData.users.push(newUser);

    // Dosyayı güncelle
    await fs.writeFile(filePath, JSON.stringify(usersData, null, 2));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 