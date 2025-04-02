import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/auth.config';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    // Récupérer les informations de la pièce jointe
    const attachment = await prisma.attachment.findUnique({
      where: {
        id: params.attachmentId,
      },
    });

    if (!attachment) {
      return new NextResponse('Pièce jointe non trouvée', { status: 404 });
    }

    // Supprimer le fichier du système de fichiers
    const filePath = join(process.cwd(), 'public', attachment.filePath);
    await unlink(filePath);

    // Supprimer l'enregistrement de la base de données
    await prisma.attachment.delete({
      where: {
        id: params.attachmentId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erreur lors de la suppression de la pièce jointe:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
} 