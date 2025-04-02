import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Créer l'organisation par défaut
  const organization = await prisma.organization.create({
    data: {
      name: 'Organisation par défaut',
      description: 'Organisation créée automatiquement',
      subdomain: 'default',
    },
  });

  // Créer l'utilisateur administrateur
  const hashedPassword = await hash('Admin123!', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Administrateur',
      email: 'admin@solopilot.com',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: organization.id,
    },
  });

  console.log('Organisation créée:', organization);
  console.log('Administrateur créé:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 