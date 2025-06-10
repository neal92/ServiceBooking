import React from 'react';
import { Button } from '../ui/Button';
import { Calendar as CalendarIcon, Filter, RefreshCw, Download } from 'lucide-react';

interface CalendarToolbarProps {
  onRefreshCalendar: () => void;
  onToggleFilterPanel?: () => void;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({ 
  onRefreshCalendar, 
  onToggleFilterPanel 
}) => {
  return (
    <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center">
        <Button
          onClick={onRefreshCalendar}
          size="sm"
          variant="ghost"
          className="text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          <span className="hidden sm:inline">Actualiser</span>
        </Button>
        
        {onToggleFilterPanel && (
          <Button
            onClick={onToggleFilterPanel}
            size="sm"
            variant="ghost" 
            className="ml-2 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filtrer</span>
          </Button>
        )}
      </div>
      
      <div className="flex items-center">
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
          onClick={() => window.print()}
        >
          <Download size={16} />
          <span className="hidden sm:inline">Exporter</span>
        </Button>
      </div>
    </div>
  );
};

export default CalendarToolbar;
