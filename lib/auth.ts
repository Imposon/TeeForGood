import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { supabase } from './supabase'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
  subscriptionStatus: string
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export const setAuthCookie = (token: string) => {
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export const getAuthUser = async (): Promise<JWTPayload | null> => {
  const token = cookies().get('auth-token')?.value
  if (!token) return null
  
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export const requireAuth = async (): Promise<JWTPayload> => {
  const user = await getAuthUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export const requireAdmin = async (): Promise<JWTPayload> => {
  const user = await requireAuth()
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
  return user
}
