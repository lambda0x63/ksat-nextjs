import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const USERNAME = process.env.AUTH_USERNAME || 'admin';
const PASSWORD = process.env.AUTH_PASSWORD || 'password';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === USERNAME && password === PASSWORD) {
      const token = jwt.sign(
        { username, authenticated: true },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json(
        { success: true, message: '로그인 성공' },
        { status: 200 }
      );

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}