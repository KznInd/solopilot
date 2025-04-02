import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Créer une organisation
  const organization = await prisma.organization.create({
    data: {
      name: 'Ma Société',
      subdomain: 'ma-societe',
      description: 'Une société de développement logiciel',
    },
  });

  // Créer un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Utilisateur Test',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: organization.id,
    },
  });

  // Créer quelques projets
  const project1 = await prisma.project.create({
    data: {
      name: 'E-commerce',
      description: 'Développement d\'un site e-commerce avec Next.js',
      status: 'ACTIVE',
      organizationId: organization.id,
      members: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App',
      description: 'Développement d\'une application mobile React Native',
      status: 'ACTIVE',
      organizationId: organization.id,
      members: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  // Créer des tâches pour les projets
  await prisma.task.createMany({
    data: [
      {
        title: 'Configuration du projet',
        description: 'Mettre en place l\'environnement de développement',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project1.id,
        assigneeId: user.id,
      },
      {
        title: 'Conception de la base de données',
        description: 'Créer le schéma de la base de données',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project1.id,
        assigneeId: user.id,
      },
      {
        title: 'Développement du panier',
        description: 'Implémenter la fonctionnalité du panier',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project1.id,
        assigneeId: user.id,
      },
      {
        title: 'Design de l\'interface',
        description: 'Créer les maquettes de l\'application',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project2.id,
        assigneeId: user.id,
      },
      {
        title: 'Configuration React Native',
        description: 'Mettre en place l\'environnement React Native',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project2.id,
        assigneeId: user.id,
      },
    ],
  });

  // Créer quelques documents
  await prisma.document.createMany({
    data: [
      {
        name: 'Cahier des charges',
        type: 'pdf',
        size: 1024,
        url: 'https://example.com/docs/cahier-des-charges.pdf',
        organizationId: organization.id,
        uploadedById: user.id,
      },
      {
        name: 'Guide de style',
        type: 'pdf',
        size: 512,
        url: 'https://example.com/docs/guide-de-style.pdf',
        organizationId: organization.id,
        uploadedById: user.id,
      },
      {
        name: 'Documentation API',
        type: 'md',
        size: 256,
        url: 'https://example.com/docs/api-docs.md',
        organizationId: organization.id,
        uploadedById: user.id,
      },
    ],
  });

  console.log('Données de test ajoutées avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 