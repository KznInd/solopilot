import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth.config';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: {
        id: params.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        comments: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!task) {
      return new NextResponse('Tâche non trouvée', { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Erreur lors de la récupération de la tâche:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate, assigneeId } = body;

    const task = await prisma.task.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    await prisma.task.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const task = await prisma.task.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
} 