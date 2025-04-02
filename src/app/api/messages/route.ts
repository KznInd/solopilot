import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Récupérer les messages entre deux utilisateurs
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  console.log('Session GET:', session);

  if (!session?.user?.id) {
    console.log('Pas d\'ID utilisateur dans la session GET');
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const otherUserId = searchParams.get('userId');

  if (!otherUserId) {
    console.log('ID utilisateur manquant dans la requête GET');
    return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 });
  }

  try {
    console.log('Récupération des messages entre:', session.user.id, 'et', otherUserId);
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log('Messages trouvés:', messages.length);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Envoyer un nouveau message
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  console.log('Session POST:', session);

  if (!session?.user?.id) {
    console.log('Pas d\'ID utilisateur dans la session POST');
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { content, receiverId, type = 'text' } = await request.json();
    console.log('Données reçues:', { content, receiverId, type, senderId: session.user.id });

    if (!content || !receiverId) {
      console.log('Données manquantes:', { content, receiverId });
      return NextResponse.json({ error: 'Contenu et destinataire requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur destinataire existe
    console.log('Vérification du destinataire:', receiverId);
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      console.log('Destinataire non trouvé:', receiverId);
      return NextResponse.json({ error: 'Destinataire non trouvé' }, { status: 404 });
    }

    // Vérifier que l'expéditeur existe
    console.log('Vérification de l\'expéditeur:', session.user.id);
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!sender) {
      console.log('Expéditeur non trouvé:', session.user.id);
      return NextResponse.json({ error: 'Expéditeur non trouvé' }, { status: 404 });
    }

    // Créer le message
    console.log('Création du message...');
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        type
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('Message créé avec succès:', message.id);
    return NextResponse.json(message);
  } catch (error) {
    console.error('Erreur détaillée lors de l\'envoi du message:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 