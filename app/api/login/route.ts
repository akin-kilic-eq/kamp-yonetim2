import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

    // users.json dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const usersData = JSON.parse(fileContent);

    // Kullanıcıyı bul
    const user = usersData.users.find(
      (u: any) => u.email === email && u.password === password
    );

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