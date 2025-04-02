import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth.config';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    // Récupérer les paramètres de filtrage depuis l'URL
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // Construire la requête avec les filtres
    const where: any = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, status, projectId, assigneeId } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        project: {
          connect: {
            id: projectId
          }
        },
        creator: {
          connect: {
            id: session.user.id
          }
        },
        ...(assigneeId ? {
          assignee: {
            connect: {
              id: assigneeId
            }
          }
        } : {})
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
} 