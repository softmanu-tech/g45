// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcryptjs from 'bcryptjs';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models/User';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }

    await dbConnect();
    
    // First check regular users
    let user = await User.findOne({ email }).select('+password');
    let isVisitor = false;
    
    // If not found in users, check visitors
    if (!user) {
      const { Visitor } = await import('@/lib/models/Visitor');
      const visitor = await Visitor.findOne({ email, canLogin: true }).select('+password');
      if (visitor) {
        user = {
          _id: visitor._id,
          email: visitor.email,
          name: visitor.name,
          password: visitor.password,
          role: 'visitor'
        };
        isVisitor = true;
      }
    }

    if (!user || !(await bcryptjs.compare(password, user.password))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = await new SignJWT({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);

      const cookieStore = await cookies(); 
      console.log("Setting cookie with token:", token);
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 2,
      });

    
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectTo: user.role === 'bishop' ? '/bishop' : 
                  user.role === 'leader' ? '/leader' : 
                  user.role === 'protocol' ? '/protocol' :
                  user.role === 'visitor' ? '/visitor' : '/member',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}
