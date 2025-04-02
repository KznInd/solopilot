import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Créer un utilisateur de test s'il n'existe pas
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Utilisateur Test',
        role: 'USER',
      },
    });

    // Créer un projet de test
    const project = await prisma.project.create({
      data: {
        name: 'Projet Test',
        description: 'Un projet pour tester les notes et les pièces jointes',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        owner: {
          connect: {
            id: testUser.id
          }
        },
        teamMembers: {
          create: {
            userId: testUser.id,
            role: 'OWNER'
          }
        },
        tasks: {
          create: [
            {
              title: 'Tâche 1',
              description: 'Première tâche de test',
              status: 'TODO',
              priority: 'MEDIUM',
              creator: {
                connect: {
                  id: testUser.id
                }
              }
            },
            {
              title: 'Tâche 2',
              description: 'Deuxième tâche de test',
              status: 'IN_PROGRESS',
              priority: 'HIGH',
              creator: {
                connect: {
                  id: testUser.id
                }
              }
            }
          ]
        }
      },
      include: {
        tasks: true,
        teamMembers: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Erreur lors de la création du projet de test:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
} 