import { notFound } from 'next/navigation';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import prisma from '@/lib/prisma';

interface KanbanPageProps {
  params: {
    id: string;
  };
}

async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
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
      },
    });

    return project;
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    return null;
  }
}

export default async function KanbanPage({ params }: KanbanPageProps) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">{project.name} - Kanban</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard projectId={params.id} />
      </div>
    </div>
  );
} 