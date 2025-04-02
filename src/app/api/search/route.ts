import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Recherche dans les tâches
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        projectId: true
      },
      take: 5
    });

    // Recherche dans les projets
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true
      },
      take: 5
    });

    // Recherche dans les tickets
    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        type: true,
        userId: true,
        assigneeId: true
      },
      take: 5
    });

    // Formater les résultats
    const results = [
      ...tasks.map(task => ({
        id: task.id,
        title: task.title,
        type: 'task' as const,
        description: task.description,
        url: `/tasks/${task.id}`
      })),
      ...projects.map(project => ({
        id: project.id,
        title: project.name,
        type: 'project' as const,
        description: project.description,
        url: `/projects/${project.id}`
      })),
      ...tickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        type: 'ticket' as const,
        description: ticket.description,
        url: `/tickets/${ticket.id}`
      }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Erreur de recherche:', error);
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 });
  }
} 