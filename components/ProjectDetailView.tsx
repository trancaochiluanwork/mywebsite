import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Project, Member, Status, ViewMode, Task } from '../types';
import { ArrowLeftIcon, ListIcon, GanttIcon, FullscreenEnterIcon, FullscreenExitIcon, EditIcon } from './Icons';
import GanttChartView from './GanttChartView';
import ProjectTaskListView from './ProjectTaskListView';

interface ProjectDetailViewProps {
  project: Project;
  members: Member[];
  statuses: Status[];
  onBack: () => void;
  onUpdateTask: (projectId: string, task: Task) => void;
  onUpdateTaskDates: (projectId: string, taskId: string, start: Date, end: Date) => void;
  onEditTask: (task: Task) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (projectId: string, parentTaskId?: string) => void;
  onEditProject: () => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, members, statuses, onBack, onUpdateTask, onUpdateTaskDates, onEditTask, onTaskClick, onAddTask, onEditProject }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const ganttContainerRef = useRef<HTMLDivElement>(null);

  const handleToggleFullScreen = useCallback(() => {
    const element = ganttContainerRef.current;
    if (!element) return;
    
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isGanttFullScreen = document.fullscreenElement === ganttContainerRef.current;
      setIsFullScreen(isGanttFullScreen);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const isGanttView = viewMode === 'gantt';

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} title="Back to projects" className="p-2 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
           <h1 className="text-3xl font-bold text-emerald-600">{project.name}</h1>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-center">
            <button onClick={onEditProject} title="Edit Project" className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900 transition-colors flex items-center gap-2">
                <EditIcon className="w-5 h-5"/>
                <span className="text-sm font-medium">Edit Project</span>
            </button>
            <div className="flex items-center bg-gray-200 rounded-lg p-1">
            <button
                onClick={() => setViewMode('list')}
                title="List View"
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                    viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-300'
                }`}
            >
                <ListIcon className="w-5 h-5" /> List
            </button>
            <button
                onClick={() => setViewMode('gantt')}
                title="Gantt Chart View"
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                    viewMode === 'gantt' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-300'
                }`}
            >
                <GanttIcon className="w-5 h-5" /> Gantt
            </button>
            </div>
             {isGanttView && (
                <button
                    onClick={handleToggleFullScreen}
                    title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900 transition-colors"
                >
                    {isFullScreen ? <FullscreenExitIcon className="w-5 h-5" /> : <FullscreenEnterIcon className="w-5 h-5" />}
                </button>
             )}
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {viewMode === 'list' ? (
          <ProjectTaskListView
            project={project}
            members={members}
            statuses={statuses}
            onUpdateTask={onUpdateTask}
            onEditTask={onEditTask}
            onAddTask={onAddTask}
          />
        ) : (
          <div ref={ganttContainerRef}>
            <GanttChartView 
                projects={[project]} 
                isFullScreen={isFullScreen} 
                statuses={statuses}
                onTaskClick={(task) => onTaskClick(task)}
                onUpdateTaskDates={(projectId, taskId, start, end) => onUpdateTaskDates(projectId, taskId, start, end)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailView;
