import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Créer l'administrateur
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.ADMIN,
      department: 'Administration'
    },
  });

  // Créer les utilisateurs
  const userPassword = await hash('user123', 12);
  const sophie = await prisma.user.create({
    data: {
      name: 'Sophie Martin',
      email: 'sophie@example.com',
      password: userPassword,
      role: Role.USER,
      department: 'Développement'
    },
  });

  const thomas = await prisma.user.create({
    data: {
      name: 'Thomas Bernard',
      email: 'thomas@example.com',
      password: userPassword,
      role: Role.USER,
      department: 'Design'
    },
  });

  const julie = await prisma.user.create({
    data: {
      name: 'Julie Dubois',
      email: 'julie@example.com',
      password: userPassword,
      role: Role.USER,
      department: 'Produit'
    },
  });

  // Créer quelques messages de test
  await prisma.message.create({
    data: {
      content: 'Bonjour Sophie ! Comment vas-tu ?',
      senderId: thomas.id,
      receiverId: sophie.id,
      type: 'text'
    }
  });

  await prisma.message.create({
    data: {
      content: 'Très bien Thomas, merci ! Et toi ?',
      senderId: sophie.id,
      receiverId: thomas.id,
      type: 'text'
    }
  });

  console.log('Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 