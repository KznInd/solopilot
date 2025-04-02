import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: session.user.id // Exclure l'utilisateur courant
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      }
    });

    // Transformer les utilisateurs en format Contact
    const contacts = users.map(user => ({
      id: user.id,
      name: user.name || 'Sans nom',
      email: user.email,
      role: user.role,
      department: user.department || 'Non défini',
      status: 'online', // Par défaut, on met tout le monde en ligne
      lastSeen: 'Maintenant',
      notifications: true
    }));

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 