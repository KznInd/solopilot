import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    return NextResponse.json({ message: 'Déconnexion réussie' });
  }
  
  return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
} 