import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/tickets
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { assigneeId: session.user.id }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des tickets' },
      { status: 500 }
    );
  }
}

// POST /api/tickets
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { title, description, status, priority, type } = await request.json();

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        status,
        priority,
        type,
        userId: session.user.id
      },
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
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du ticket' },
      { status: 500 }
    );
  }
} 