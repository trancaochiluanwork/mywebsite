import React from 'react';
import { ViewMode, AppTab } from '../types';
import { ListIcon, GanttIcon, FullscreenEnterIcon, FullscreenExitIcon } from './Icons';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onToggleFullScreen: () => void;
  isFullScreen: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, viewMode, setViewMode, onToggleFullScreen, isFullScreen }) => {
  const tabs: { id: AppTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tasks', label: 'Task Management' },
    { id: 'project-management', label: 'Project Management' },
    { id: 'settings', label: 'Settings' },
  ];
  
  const isGanttViewOnDashboard = activeTab === 'dashboard' && viewMode === 'gantt';

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-200">
       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
        <h1 className="text-3xl font-bold text-emerald-600">CCTPA Flow</h1>
        <nav className="flex items-center space-x-1 bg-gray-200 p-1 rounded-lg">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center space-x-2 mt-4 sm:mt-0">
        {activeTab === 'dashboard' && (
            <div className="flex items-center bg-gray-200 rounded-lg p-1">
            <button
                onClick={() => setViewMode('list')}
                title="List View"
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-300'
                }`}
            >
                <ListIcon className="w-5 h-5" />
                <span>List</span>
            </button>
            <button
                onClick={() => setViewMode('gantt')}
                title="Gantt Chart View"
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                viewMode === 'gantt' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-300'
                }`}
            >
                <GanttIcon className="w-5 h-5" />
                <span>Gantt</span>
            </button>
            </div>
        )}
        {isGanttViewOnDashboard && (
          <button
            onClick={onToggleFullScreen}
            title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900 transition-colors"
          >
            {isFullScreen ? <FullscreenExitIcon className="w-5 h-5" /> : <FullscreenEnterIcon className="w-5 h-5" />}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;