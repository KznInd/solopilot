import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('Aucun fichier fourni', { status: 400 });
    }

    // Ici, vous devrez implémenter la logique pour stocker le fichier
    // (par exemple avec AWS S3, Cloudinary, etc.)
    // Pour cet exemple, nous allons simplement stocker le nom du fichier

    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.name,
        filePath: `/uploads/${file.name}`, // Exemple de chemin
        fileSize: file.size,
        fileType: file.type,
        task: {
          connect: {
            id: params.id
          }
        },
        creator: {
          connect: {
            id: session.user.id
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la pièce jointe:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const attachments = await prisma.attachment.findMany({
      where: {
        taskId: params.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error('Erreur lors de la récupération des pièces jointes:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
} 