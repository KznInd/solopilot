import { CubeIcon } from '@heroicons/react/24/outline';

export default function InventoryPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des Stocks</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <CubeIcon className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Produits en Stock</h3>
              <p className="text-gray-500">Fonctionnalité à venir</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 