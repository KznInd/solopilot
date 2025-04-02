'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, addWeeks, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import CreateEventModal from './CreateEventModal';
import { Tooltip } from '@/components/ui/Tooltip';
import EventDetailsModal from './EventDetailsModal';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'PROJECT' | 'TASK' | 'MEETING' | 'OTHER';
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
  participants: {
    id: string;
    name: string;
    avatar: string;
  }[];
}

interface EventColors {
  PROJECT: string;
  TASK: string;
  MEETING: string;
  OTHER: string;
}

const eventColors: EventColors = {
  PROJECT: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  TASK: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  MEETING: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  OTHER: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
};

type ViewType = 'month' | 'week' | 'day';

const fetchEvents = async (currentDate: Date) => {
  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
  const response = await fetch(`/api/events?startDate=${startDate}&endDate=${endDate}`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des événements');
  }
  return response.json();
};

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['events', format(currentDate, 'yyyy-MM')],
    queryFn: () => fetchEvents(currentDate)
  });

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsCreateModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };

  // Rafraîchir les événements après une création ou suppression
  const handleEventChange = () => {
    refetch();
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const days = [];
    let day = startDate;

    const handleDayDoubleClick = (date: Date) => {
      setSelectedDate(date);
      setIsCreateModalOpen(true);
    };

    for (let i = 0; i < 42; i++) {
      const dayEvents = events?.filter((event: Event) => 
        isSameDay(new Date(event.startDate), day)
      ) || [];

      days.push(
        <motion.div
          key={day.toString()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`
            p-2 border border-primary-500/10 min-h-[120px]
            ${!isSameMonth(day, monthStart)
              ? 'text-secondary-400 bg-background/30'
              : 'bg-background/50 hover:bg-background/80 transition-colors'
            }
            ${isToday(day)
              ? 'border-primary-500 bg-primary-50/50'
              : ''
            }
          `}
          onClick={() => handleDayClick(day)}
          onDoubleClick={() => handleDayClick(day)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`
              font-medium
              ${isToday(day) ? 'text-primary-500' : ''}
            `}>
              {format(day, 'd')}
            </span>
            {dayEvents.length > 0 && (
              <Tooltip content={`${dayEvents.length} événement${dayEvents.length > 1 ? 's' : ''}`}>
                <div className="w-2 h-2 rounded-full bg-primary-500" />
              </Tooltip>
            )}
          </div>
          <div className="space-y-1">
            {dayEvents.map((event: Event) => (
              <Tooltip
                key={event.id}
                content={
                  <div className="p-2">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-secondary-600">
                      {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                    </div>
                    {event.description && (
                      <div className="text-sm mt-1">{event.description}</div>
                    )}
                  </div>
                }
              >
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-1 text-xs rounded border ${eventColors[event.type]} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={(e) => handleEventClick(e, event)}
                >
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{format(new Date(event.startDate), 'HH:mm')}</span>
                  </div>
                  <div className="font-medium truncate">{event.title}</div>
                </motion.div>
              </Tooltip>
            ))}
          </div>
        </motion.div>
      );
      day = addDays(day, 1);
    }

    return (
      <div className="grid grid-cols-7 gap-px">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(weekDay => (
          <div key={weekDay} className="p-2 text-center font-medium text-secondary-600 bg-background/80">
            {weekDay}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { locale: fr });
    const days = [];
    let day = weekStart;

    for (let i = 0; i < 7; i++) {
      const dayEvents = events?.filter((event: Event) => 
        isSameDay(new Date(event.startDate), day)
      ) || [];

      days.push(
        <div
          key={day.toString()}
          className="min-h-[200px] p-4 border-b border-r border-primary-500/10"
        >
          <div className="font-medium mb-4">
            {format(day, 'EEEE d', { locale: fr })}
          </div>
          <div className="space-y-2">
            {dayEvents.map((event: Event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2 rounded border ${eventColors[event.type]}`}
              >
                <div className="flex items-center gap-1 text-sm">
                  <ClockIcon className="w-4 h-4" />
                  <span>{format(new Date(event.startDate), 'HH:mm')}</span>
                  <span>-</span>
                  <span>{format(new Date(event.endDate), 'HH:mm')}</span>
                </div>
                <div className="font-medium">{event.title}</div>
                {event.description && (
                  <div className="text-sm text-secondary-600">{event.description}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }

    return (
      <div className="grid grid-cols-7">
        {days}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = events?.filter((event: Event) => 
      isSameDay(new Date(event.startDate), currentDate)
    ) || [];

    return (
      <div className="p-6">
        <div className="font-medium text-xl mb-6">
          {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </div>
        <div className="space-y-4">
          {dayEvents.map((event: Event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${eventColors[event.type]}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-lg">{event.title}</div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-5 h-5" />
                  <span>{format(new Date(event.startDate), 'HH:mm')}</span>
                  <span>-</span>
                  <span>{format(new Date(event.endDate), 'HH:mm')}</span>
                </div>
              </div>
              {event.description && (
                <div className="mt-2 text-secondary-600">{event.description}</div>
              )}
              {event.participants.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Participants :</div>
                  <div className="flex flex-wrap gap-2">
                    {event.participants.map((participant: { id: string; name: string; avatar: string }) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50"
                      >
                        {participant.avatar && (
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span>{participant.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {dayEvents.length === 0 && (
            <div className="text-center py-12 text-secondary-600">
              Aucun événement prévu ce jour
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Calendrier</h1>
          <div className="flex items-center gap-2 bg-background/50 dark:bg-black/20 rounded-lg border border-primary-500/10 p-1">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  view === viewType
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-primary-500/10'
                }`}
              >
                {viewType === 'month' ? 'Mois' :
                 viewType === 'week' ? 'Semaine' : 'Jour'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nouvel événement</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                switch (view) {
                  case 'month':
                    setCurrentDate(prev => addMonths(prev, -1));
                    break;
                  case 'week':
                    setCurrentDate(prev => addWeeks(prev, -1));
                    break;
                  case 'day':
                    setCurrentDate(prev => addDays(prev, -1));
                    break;
                }
              }}
              className="p-1 rounded-lg hover:bg-primary-500/10 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              className="px-4 py-2 font-medium"
              onClick={() => setCurrentDate(new Date())}
            >
              {view === 'month' 
                ? format(currentDate, 'MMMM yyyy', { locale: fr })
                : view === 'week'
                ? `Semaine du ${format(startOfWeek(currentDate, { locale: fr }), 'd MMMM', { locale: fr })}`
                : format(currentDate, 'EEEE d MMMM', { locale: fr })
              }
            </button>
            <button
              onClick={() => {
                switch (view) {
                  case 'month':
                    setCurrentDate(prev => addMonths(prev, 1));
                    break;
                  case 'week':
                    setCurrentDate(prev => addWeeks(prev, 1));
                    break;
                  case 'day':
                    setCurrentDate(prev => addDays(prev, 1));
                    break;
                }
              }}
              className="p-1 rounded-lg hover:bg-primary-500/10 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-96 bg-primary-500/10 rounded-lg"></div>
        </div>
      ) : (
        <div className="bg-background/50 dark:bg-black/20 rounded-lg border border-primary-500/10 overflow-hidden">
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </div>
      )}

      {isCreateModalOpen && selectedDate && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedDate(null);
          }}
          initialDate={selectedDate}
          onEventCreated={handleEventChange}
        />
      )}

      {selectedEvent && (
        <EventDetailsModal
          event={{
            ...selectedEvent,
            startDate: new Date(selectedEvent.startDate),
            endDate: new Date(selectedEvent.endDate)
          }}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleEventChange}
        />
      )}
    </div>
  );
} 