import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('Route de création de projets appelée');
  try {
    // Utiliser l'utilisateur admin existant
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    console.log('Utilisateur admin trouvé:', adminUser);

    if (!adminUser) {
      return new NextResponse('Utilisateur admin non trouvé', { status: 404 });
    }

    // Créer plusieurs projets de test
    const projects = await Promise.all([
      // Projet 1: Développement Web
      prisma.project.create({
        data: {
          name: 'Développement Site E-commerce',
          description: 'Création d\'un site e-commerce avec Next.js et Prisma',
          status: 'ACTIVE',
          priority: 'HIGH',
          owner: { connect: { id: adminUser.id } },
          teamMembers: {
            create: { userId: adminUser.id, role: 'OWNER' }
          },
          tasks: {
            create: [
              {
                title: 'Configuration du projet',
                description: 'Initialisation du projet et configuration des dépendances',
                status: 'DONE',
                priority: 'HIGH',
                creator: { connect: { id: adminUser.id } }
              },
              {
                title: 'Authentification',
                description: 'Implémentation de l\'authentification avec NextAuth',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                creator: { connect: { id: adminUser.id } }
              },
              {
                title: 'Page produits',
                description: 'Création de la page de listing des produits',
                status: 'TODO',
                priority: 'MEDIUM',
                creator: { connect: { id: adminUser.id } }
              }
            ]
          }
        }
      }),

      // Projet 2: Application Mobile
      prisma.project.create({
        data: {
          name: 'Application Mobile React Native',
          description: 'Développement d\'une application mobile de gestion de tâches',
          status: 'ACTIVE',
          priority: 'MEDIUM',
          owner: { connect: { id: adminUser.id } },
          teamMembers: {
            create: { userId: adminUser.id, role: 'OWNER' }
          },
          tasks: {
            create: [
              {
                title: 'Design UI/UX',
                description: 'Création des maquettes de l\'application',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                creator: { connect: { id: adminUser.id } }
              },
              {
                title: 'Configuration React Native',
                description: 'Setup du projet React Native',
                status: 'TODO',
                priority: 'HIGH',
                creator: { connect: { id: adminUser.id } }
              }
            ]
          }
        }
      }),

      // Projet 3: Maintenance
      prisma.project.create({
        data: {
          name: 'Maintenance Infrastructure',
          description: 'Maintenance et mise à jour de l\'infrastructure serveur',
          status: 'ON_HOLD',
          priority: 'LOW',
          owner: { connect: { id: adminUser.id } },
          teamMembers: {
            create: { userId: adminUser.id, role: 'OWNER' }
          },
          tasks: {
            create: [
              {
                title: 'Mise à jour serveurs',
                description: 'Mise à jour des serveurs de production',
                status: 'TODO',
                priority: 'LOW',
                creator: { connect: { id: adminUser.id } }
              }
            ]
          }
        }
      }),

      // Projet 4: Formation
      prisma.project.create({
        data: {
          name: 'Formation Équipe',
          description: 'Formation de l\'équipe sur les nouvelles technologies',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          owner: { connect: { id: adminUser.id } },
          teamMembers: {
            create: { userId: adminUser.id, role: 'OWNER' }
          },
          tasks: {
            create: [
              {
                title: 'Formation React',
                description: 'Formation sur React et ses hooks',
                status: 'DONE',
                priority: 'MEDIUM',
                creator: { connect: { id: adminUser.id } }
              },
              {
                title: 'Formation TypeScript',
                description: 'Formation sur TypeScript',
                status: 'DONE',
                priority: 'MEDIUM',
                creator: { connect: { id: adminUser.id } }
              }
            ]
          }
        }
      })
    ]);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erreur lors de la création des projets de test:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
} 