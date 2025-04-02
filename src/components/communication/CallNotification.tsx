import { motion } from 'framer-motion';
import { VideoCameraIcon, PhoneXMarkIcon } from '@heroicons/react/24/outline';

interface CallNotificationProps {
  callerName: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function CallNotification({ callerName, onAccept, onReject }: CallNotificationProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-4 z-50"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
          <VideoCameraIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-medium">Appel entrant</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{callerName}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
        >
          <VideoCameraIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onReject}
          className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          <PhoneXMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
} 