import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  PlusIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import prisma from '@/lib/prisma';

interface ProjectPageProps {
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
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
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
        _count: {
          select: {
            tasks: true,
            comments: true,
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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  const navigation = [
    {
      name: 'Vue d\'ensemble',
      href: `/dashboard/projects/${params.id}`,
      icon: ChartBarIcon,
    },
    {
      name: 'Kanban',
      href: `/dashboard/projects/${params.id}/kanban`,
      icon: ClipboardDocumentListIcon,
    },
    {
      name: 'Équipe',
      href: `/dashboard/projects/${params.id}/team`,
      icon: UserGroupIcon,
    },
    {
      name: 'Paramètres',
      href: `/dashboard/projects/${params.id}/settings`,
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <div className="h-full flex">
      <div className="w-64 bg-background/80 dark:bg-black/30 backdrop-blur-xl border-r border-border/50 p-4">
        <h1 className="text-xl font-bold mb-6">{project.name}</h1>
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Vue d'ensemble</h2>
          <Link
            href={`/dashboard/projects/${params.id}/tasks/new`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvelle tâche
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <ClipboardDocumentListIcon className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">{project._count.tasks}</h3>
                <p className="text-sm text-muted-foreground">Tâches au total</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <ChatBubbleLeftIcon className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">{project._count.comments}</h3>
                <p className="text-sm text-muted-foreground">Commentaires</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <UserGroupIcon className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">{project.teamMembers.length}</h3>
                <p className="text-sm text-muted-foreground">Membres de l'équipe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Équipe */}
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Équipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.teamMembers.map((member) => (
              <div key={member.user.id} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  {member.user.image ? (
                    <Image
                      src={member.user.image}
                      alt={member.user.name || member.user.email}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{member.user.name || member.user.email}</p>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 