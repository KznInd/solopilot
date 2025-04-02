'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ redirect: false });
    router.push('/login');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Déconnexion
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Êtes-vous sûr de vouloir vous déconnecter ?
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Annuler
          </button>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {loading ? 'Déconnexion...' : 'Se déconnecter'}
          </button>
        </div>
      </div>
    </div>
  );
} 