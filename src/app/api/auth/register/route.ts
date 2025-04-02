import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    console.log('Début de la requête d\'inscription');
    const { name, email, password, organization } = await request.json();
    console.log('Données reçues:', { name, email, organization });

    // Vérifier si l'utilisateur existe déjà
    console.log('Vérification de l\'existence de l\'utilisateur...');
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Utilisateur déjà existant:', email);
      return NextResponse.json(
        { message: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    console.log('Hashage du mot de passe...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    console.log('Création de l\'utilisateur...');
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER', // Rôle par défaut
        department: organization // Utiliser le champ organization comme department
      }
    });

    console.log('Utilisateur créé avec succès:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department
    });

    return NextResponse.json(
      { 
        message: 'Utilisateur créé avec succès',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur détaillée lors de l\'inscription:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
} 