import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const eventSelect = {
  creator: {
    select: {
      id: true,
      name: true,
      email: true
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
          email: true
        }
      }
    }
  }
} satisfies Prisma.EventSelect;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: eventSelect
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    const isParticipant = event.participants.some(
      (p) => p.user.id === session.user.id
    );

    if (event.creatorId !== session.user.id && !isParticipant) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'événement' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { participants: true }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    if (event.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
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

    // Supprimer les participants qui ne sont plus dans la liste
    if (participants) {
      await prisma.userEvent.deleteMany({
        where: {
          eventId: params.id,
          userId: {
            notIn: participants as string[]
          }
        }
      });

      // Ajouter les nouveaux participants
      const existingParticipants = event.participants.map(p => p.userId);
      const newParticipants = (participants as string[]).filter(
        userId => !existingParticipants.includes(userId)
      );

      await Promise.all(
        newParticipants.map(userId =>
          prisma.userEvent.create({
            data: {
              eventId: params.id,
              userId,
              status: userId === session.user.id ? 'ACCEPTED' : 'PENDING'
            }
          })
        )
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        type,
        project: projectId ? { connect: { id: projectId } } : undefined,
        task: taskId ? { connect: { id: taskId } } : undefined
      },
      include: eventSelect
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'événement' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    if (event.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    await prisma.event.delete({
      where: { id: params.id }
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