import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient, TaskStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/projects
export async function GET() {
  try {
    console.log('GET /api/projects - Début');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.id) {
      console.log('Pas de session ou pas d\'ID utilisateur');
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    console.log('Recherche des projets pour l\'utilisateur:', session.user.id);
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            teamMembers: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true,
            comments: true
          }
        },
        tasks: {
          where: {
            status: TaskStatus.DONE
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log('Projets trouvés:', projects.length);

    // Ajouter le compteur de tâches complétées
    const projectsWithCompletedTasks = projects.map(project => {
      const { tasks, ...projectWithoutTasks } = project;
      return {
        ...projectWithoutTasks,
        _count: {
          ...project._count,
          completedTasks: tasks.length
        }
      };
    });

    return NextResponse.json(projectsWithCompletedTasks);
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

// POST /api/projects
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { name, description, status, priority, dueDate } = await request.json();

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        ownerId: session.user.id,
        teamMembers: {
          create: {
            userId: session.user.id,
            role: 'OWNER'
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
} 