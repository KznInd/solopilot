import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/auth.config';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    const comment = await prisma.comment.update({
      where: {
        id: params.commentId,
      },
      data: {
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    await prisma.comment.delete({
      where: {
        id: params.commentId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
} 