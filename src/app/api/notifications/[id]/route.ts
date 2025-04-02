import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Supprimer d'abord les participations à l'événement
    await prisma.$executeRawUnsafe(
      `DELETE FROM "UserEvent" WHERE "eventId" = $1`,
      params.id
    );

    // Puis supprimer l'événement
    await prisma.$executeRawUnsafe(
      `DELETE FROM "Event" WHERE id = $1`,
      params.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la notification' },
      { status: 500 }
    );
  }
} 