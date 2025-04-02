'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import EventDetailsModal from '@/components/calendar/EventDetailsModal';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    title: string;
  };
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const response = await fetch(`/api/events?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des événements');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.startDate), date) || 
      isSameDay(new Date(event.endDate), date)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={previousMonth}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['L', 'M', 'Me', 'J', 'V', 'S', 'D'].map((day, index) => (
            <div
              key={`weekday-${index}`}
              className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 mt-1">
          {days.map((day, dayIdx) => (
            <div
              key={day.toString()}
              className={`
                min-h-[100px] bg-white p-2
                ${!isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : ''}
              `}
            >
              <div className="text-sm font-semibold text-gray-900">
                {format(day, 'd')}
              </div>
              <div className="mt-1">
                {getEventsForDay(day).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`
                      text-xs p-1 rounded mb-1 truncate cursor-pointer hover:opacity-75
                      ${event.type === 'MEETING' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'TASK' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'}
                    `}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
} 