import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    const events = await prisma.event.findMany({
      where: {
        AND: [
          startDate ? { startDate: { gte: new Date(startDate) } } : {},
          endDate ? { endDate: { lte: new Date(endDate) } } : {},
          type ? { type: type as any } : {},
          {
            OR: [
              { creatorId: session.user.id },
              {
                participants: {
                  some: {
                    userId: session.user.id,
                    status: 'ACCEPTED'
                  }
                }
              }
            ]
          }
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        },
        task: {
          select: {
            id: true,
            title: true
          }
        },
        participants: {
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
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      type,
      projectId,
      taskId,
      participants
    } = data;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        creatorId: session.user.id,
        ...(projectId && { project: { connect: { id: projectId } } }),
        ...(taskId && { task: { connect: { id: taskId } } }),
        participants: {
          create: participants.map((userId: string) => ({
            user: { connect: { id: userId } },
            status: userId === session.user.id ? 'ACCEPTED' : 'PENDING'
          }))
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        },
        task: {
          select: {
            id: true,
            title: true
          }
        },
        participants: {
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

    return NextResponse.json(event);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de l\'événement requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'événement existe et si l'utilisateur est le créateur
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { creatorId: true }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    if (event.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer cet événement' },
        { status: 403 }
      );
    }

    // Supprimer d'abord les participants de l'événement
    await prisma.userEvent.deleteMany({
      where: { eventId }
    });

    // Puis supprimer l'événement
    await prisma.event.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'événement' },
      { status: 500 }
    );
  }
} 