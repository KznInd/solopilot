import { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

interface UserWithPassword {
  id: string;
  email: string | null;
  name: string | null;
  password: string;
  role: Role;
}

// Étendre les types de next-auth
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      email: string;
      name?: string | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Tentative de connexion avec:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('Email ou mot de passe manquant');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');

        if (!user || !user.password) {
          console.log('Utilisateur non trouvé ou pas de mot de passe');
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log('Mot de passe valide:', isPasswordValid ? 'Oui' : 'Non');

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email || '',
          name: user.name || '',
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
}; 