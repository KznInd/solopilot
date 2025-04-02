'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  type: 'task' | 'project' | 'ticket';
  description?: string;
  url: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchItems = async () => {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Erreur de recherche:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchItems();
  }, [debouncedQuery]);

  const handleResultClick = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher..."
          className="w-full pl-10 pr-4 py-2 bg-secondary/10 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-black/20"
        />
      </div>

      <AnimatePresence>
        {isOpen && (query || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background/80 dark:bg-black/30 backdrop-blur-xl border border-border/50 rounded-lg shadow-lg overflow-hidden"
          >
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Recherche en cours...
              </div>
            ) : results && results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.url)}
                    className="w-full text-left px-4 py-2 hover:bg-secondary/50 dark:hover:bg-secondary-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {result.title}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {result.type}
                      </span>
                    </div>
                    {result.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Aucun résultat trouvé
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 