import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Créer une organisation
    const organization = await prisma.$transaction(async (tx) => {
      return await tx.organization.create({
        data: {
          name: 'Ma Société',
          subdomain: 'ma-societe',
          description: 'Une société de développement logiciel',
        },
      });
    });

    // Créer un utilisateur de test
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.$transaction(async (tx) => {
      return await tx.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          name: 'Utilisateur Test',
          password: hashedPassword,
          role: 'ADMIN',
          organization: {
            connect: {
              id: organization.id
            }
          }
        },
      });
    });

    // Créer quelques projets
    const project1 = await prisma.$transaction(async (tx) => {
      return await tx.project.create({
        data: {
          name: 'E-commerce',
          description: 'Développement d\'un site e-commerce avec Next.js',
          status: 'ACTIVE',
          organization: {
            connect: {
              id: organization.id
            }
          },
          priority: 'HIGH',
          owner: {
            connect: {
              id: user.id
            }
          },
          teamMembers: {
            create: {
              userId: user.id,
              role: 'OWNER'
            }
          }
        },
      });
    });

    const project2 = await prisma.$transaction(async (tx) => {
      return await tx.project.create({
        data: {
          name: 'Mobile App',
          description: 'Développement d\'une application mobile React Native',
          status: 'ACTIVE',
          organization: {
            connect: {
              id: organization.id
            }
          },
          priority: 'HIGH',
          owner: {
            connect: {
              id: user.id
            }
          },
          teamMembers: {
            create: {
              userId: user.id,
              role: 'OWNER'
            }
          }
        },
      });
    });

    // Créer des tâches pour les projets
    await prisma.$transaction(async (tx) => {
      await tx.task.createMany({
        data: [
          {
            title: 'Configuration du projet',
            description: 'Mettre en place l\'environnement de développement',
            status: 'DONE',
            priority: 'HIGH',
            projectId: project1.id,
            assigneeId: user.id,
            creatorId: user.id
          },
          {
            title: 'Conception de la base de données',
            description: 'Créer le schéma de la base de données',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            projectId: project1.id,
            assigneeId: user.id,
            creatorId: user.id
          },
          {
            title: 'Développement du panier',
            description: 'Implémenter la fonctionnalité du panier',
            status: 'TODO',
            priority: 'MEDIUM',
            projectId: project1.id,
            assigneeId: user.id,
            creatorId: user.id
          },
          {
            title: 'Design de l\'interface',
            description: 'Créer les maquettes de l\'application',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            projectId: project2.id,
            assigneeId: user.id,
            creatorId: user.id
          },
          {
            title: 'Configuration React Native',
            description: 'Mettre en place l\'environnement React Native',
            status: 'TODO',
            priority: 'MEDIUM',
            projectId: project2.id,
            assigneeId: user.id,
            creatorId: user.id
          },
        ],
      });
    });

    console.log('Données de test ajoutées avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des données de test:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 