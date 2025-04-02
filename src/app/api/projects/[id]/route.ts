import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth.config';
import prisma from '@/lib/prisma';

// GET /api/projects/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        teamMembers: {
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
        },
        tasks: true,
        _count: {
          select: {
            tasks: true,
            comments: true,
          },
        },
      },
    });

    if (!project) {
      return new NextResponse('Projet non trouvé', { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

// PUT /api/projects/[id]
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
    const { name, description, status, priority, dueDate } = body;

    const project = await prisma.project.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    // Vérifier si l'utilisateur a les droits de suppression
    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
      select: {
        ownerId: true,
      },
    });

    if (!project) {
      return new NextResponse('Projet non trouvé', { status: 404 });
    }

    if (project.ownerId !== session.user.id) {
      return new NextResponse('Non autorisé', { status: 403 });
    }

    await prisma.project.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}
 