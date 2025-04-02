import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Simuler des données pour la démo
const mockStats = {
  totalProjects: 12,
  activeProjects: 5,
  completedTasks: 156,
  pendingTasks: 43
};

export async function GET() {
  try {
    // Dans un cas réel, vous récupéreriez ces données depuis votre base de données
    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
} 