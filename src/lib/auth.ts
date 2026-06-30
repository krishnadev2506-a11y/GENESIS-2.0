import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthPayload {
  id: string;
  role: 'admin' | 'user';
  teamId?: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
}

export function signToken(payload: AuthPayload): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, getJwtSecret(), { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateCredentials(teamName: string): { username: string; password: string } {
  const usernameBase = teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  const username = `${usernameBase}${randomSuffix}`;
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return { username, password };
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: 'genesis_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function getTokenFromCookies(request: NextRequest): string | null {
  const token = request.cookies.get('genesis_token')?.value;
  return token || null;
}

export async function requireAuth(request: NextRequest, requiredRole?: 'admin' | 'user'): Promise<AuthPayload> {
  const token = getTokenFromCookies(request);
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    throw new Error('Invalid or expired token');
  }
  
  if (requiredRole && payload.role !== requiredRole) {
    throw new Error('Insufficient permissions');
  }
  
  return payload;
}


