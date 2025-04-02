import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    const note = await prisma.note.create({
      data: {
        content,
        task: {
          connect: {
            id: params.id
          }
        },
        creator: {
          connect: {
            id: session.user.id
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Erreur lors de la création de la note:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const notes = await prisma.note.findMany({
      where: {
        taskId: params.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
} 