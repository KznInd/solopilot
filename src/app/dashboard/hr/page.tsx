import { UserGroupIcon, BriefcaseIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export default function HRPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ressources Humaines</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <UserGroupIcon className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Employés</h3>
              <p className="text-gray-500">Gestion des employés</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <BriefcaseIcon className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Recrutement</h3>
              <p className="text-gray-500">Processus de recrutement</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <AcademicCapIcon className="w-8 h-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">Formation</h3>
              <p className="text-gray-500">Gestion des formations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 