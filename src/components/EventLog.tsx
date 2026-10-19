import React, { useEffect, useRef } from 'react';

export interface GameEvent {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'discovery';
  tick: number;
}

interface EventLogProps {
  events: GameEvent[];
}

const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getEventColor = (type: GameEvent['type']) => {
    switch (type) {
      case 'info': return 'text-gray-300';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-amber-400';
      case 'discovery': return 'text-purple-400';
    }
  };

  const getEventIcon = (type: GameEvent['type']) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'discovery': return '🔍';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-2">
      <h3 className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1">
        📜 Registro
      </h3>
      <div 
        ref={scrollRef}
        className="h-28 overflow-y-auto space-y-0.5 scrollbar-thin"
      >
        {events.length === 0 ? (
          <p className="text-xs text-gray-500 italic">Sin eventos...</p>
        ) : (
          events.slice(-20).map(event => (
            <div key={event.id} className={`text-xs ${getEventColor(event.type)} flex items-start gap-1`}>
              <span className="flex-shrink-0">{getEventIcon(event.type)}</span>
              <span className="opacity-80">[{event.tick}]</span>
              <span>{event.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventLog;
