'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      Se déconnecter
    </button>
  );
} 