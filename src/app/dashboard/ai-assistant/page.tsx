'use client';

import { useState } from 'react';
import { SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function AIAssistantPage() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'assistant', content: string}>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Ajouter le message de l'utilisateur à l'historique
    setChatHistory(prev => [...prev, { type: 'user', content: message }]);
    
    // Simuler une réponse de l'assistant (à remplacer par une vraie API)
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        type: 'assistant', 
        content: "Je suis votre assistant IA. Cette fonctionnalité sera bientôt disponible." 
      }]);
    }, 1000);

    setMessage('');
  };

  return (
    <div className="p-6 h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold">Assistant IA</h1>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 overflow-y-auto">
        <div className="space-y-4">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  chat.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {chat.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 p-4 bg-white dark:bg-gray-800"
        />
        <button
          type="submit"
          className="px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
} 