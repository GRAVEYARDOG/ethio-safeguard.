
import React from 'react';
import { Notification } from '../types';
import { ICONS } from '../constants';

interface NotificationCenterProps {
  notifications: Notification[];
  onClear: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onClear }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-full max-w-sm pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {notifications.slice(0, 3).map((note) => (
          <div 
            key={note.id} 
            className={`p-4 rounded-2xl shadow-2xl border flex gap-4 animate-in slide-in-from-bottom-5 transition-all duration-300 ${
              note.type === 'SUCCESS' ? 'bg-green-50 border-green-200' :
              note.type === 'WARNING' ? 'bg-amber-50 border-amber-200' :
              'bg-white border-slate-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
              note.type === 'SUCCESS' ? 'bg-green-100 text-green-600' :
              note.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {note.type === 'SUCCESS' ? <ICONS.CheckCircle className="w-5 h-5" /> :
               note.type === 'WARNING' ? <ICONS.AlertTriangle className="w-5 h-5" /> :
               <ICONS.Bell className="w-5 h-5" />}
            </div>
            <div className="flex-grow">
              <h4 className="text-sm font-bold text-slate-900">{note.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{note.message}</p>
              <button 
                onClick={() => onClear(note.id)}
                className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
