import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId, status } = await request.json();

    if (!eventId || !status) {
      return NextResponse.json(
        { error: 'eventId et status sont requis' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut de la participation avec une requête SQL directe
    await prisma.$executeRawUnsafe(
      `UPDATE "UserEvent" SET status = $1, "updatedAt" = NOW() WHERE "userId" = $2 AND "eventId" = $3`,
      status,
      session.user.id,
      eventId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les notifications avec une requête SQL directe
    const notifications = await prisma.$queryRaw`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.type,
        e."startDate",
        e."endDate",
        ue.status,
        p.id as "projectId",
        p.name as "projectName",
        t.id as "taskId",
        t.title as "taskTitle",
        u.id as "createdById",
        u.name as "createdByName",
        u.email as "createdByEmail",
        u.image as "createdByImage"
      FROM "Event" e
      JOIN "UserEvent" ue ON e.id = ue."eventId"
      LEFT JOIN "Project" p ON e."projectId" = p.id
      LEFT JOIN "Task" t ON e."taskId" = t.id
      JOIN "User" u ON e."createdById" = u.id
      WHERE ue."userId" = ${session.user.id}
      ORDER BY e."startDate" DESC
    `;

    // Formater les notifications pour correspondre à l'interface Notification
    const formattedNotifications = notifications.map((n: any) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      startDate: n.startDate.toISOString(),
      endDate: n.endDate.toISOString(),
      type: n.type,
      project: n.projectId ? {
        id: n.projectId,
        name: n.projectName
      } : null,
      task: n.taskId ? {
        id: n.taskId,
        title: n.taskTitle
      } : null,
      createdBy: {
        id: n.createdById,
        name: n.createdByName,
        email: n.createdByEmail,
        image: n.createdByImage
      },
      status: n.status
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
} 