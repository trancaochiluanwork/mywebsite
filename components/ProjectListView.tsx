import React, { useState } from 'react';
import { Project, Task, Member, Status } from '../types';
import { ChevronDownIcon, EditIcon } from './Icons';
import EditableText from './EditableText';

interface ProjectListViewProps {
  projects: Project[];
  members: Member[];
  statuses: Status[];
  onUpdateProjectName: (projectId: string, newName: string) => void;
  onSelectProject: (projectId: string) => void;
}

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
            className="bg-emerald-500 h-2 rounded-full" 
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

const TaskListItem: React.FC<{ 
    task: Task; 
    project: Project;
    members: Member[];
    statuses: Status[];
    level: number;
    onSelectProject: (projectId: string) => void;
}> = ({ task, project, members, statuses, level, onSelectProject }) => {
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const assignedMembers = task.assigneeIds.map(id => members.find(m => m.id === id)).filter(Boolean) as Member[];
    const status = statuses.find(s => s.id === task.statusId);

    // This component no longer handles name updates, navigation is the primary action.
    // Quick edit can be re-introduced inside the detail view.

    return (
        <>
            <div onClick={() => onSelectProject(project.id)} className="grid grid-cols-10 gap-4 items-center py-2 px-4 hover:bg-gray-100/50 rounded-lg transition-colors cursor-pointer">
                <div className="col-span-10 sm:col-span-5 flex items-center">
                    <div style={{ paddingLeft: `${level * 2}rem` }} className="flex-grow flex items-center gap-3">
                         <span className={`w-2 h-2 rounded-full ${status?.color || 'bg-gray-300'}`} title={status?.label}></span>
                         <span className="text-gray-800">{task.name}</span>
                    </div>
                </div>
                <div className="col-span-5 sm:col-span-2 text-sm text-gray-500">{formatDate(task.start)} - {formatDate(task.end)}</div>
                <div className="col-span-5 sm:col-span-3 flex items-center gap-4">
                     <div className="flex -space-x-2 overflow-hidden">
                        {assignedMembers.map(member => (
                            <img key={member.id} className="inline-block h-7 w-7 rounded-full ring-2 ring-white" src={member.avatar} alt={member.name} title={member.name}/>
                        ))}
                    </div>
                    <div className="flex-grow flex items-center gap-2">
                         <ProgressBar progress={task.progress} />
                         <span className="text-sm font-medium text-gray-600 w-10 text-right">{task.progress}%</span>
                    </div>
                </div>
            </div>
            {task.subtasks?.map(subtask => (
                <TaskListItem key={subtask.id} task={subtask} project={project} members={members} statuses={statuses} level={level + 1} onSelectProject={onSelectProject} />
            ))}
        </>
    );
};

const ProjectItem: React.FC<{ 
    project: Project;
    members: Member[];
    statuses: Status[];
    onUpdateProjectName: (projectId: string, newName: string) => void;
    onSelectProject: (projectId: string) => void;
}> = ({ project, members, statuses, onUpdateProjectName, onSelectProject }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const allTasks = (tasks: Task[]): Task[] => tasks.flatMap(t => [t, ...(t.subtasks ? allTasks(t.subtasks) : [])]);
  const flatTasks = allTasks(project.tasks);
  const totalTasks = flatTasks.length;
  const avgProgress = totalTasks > 0 ? Math.round(flatTasks.reduce((acc, t) => acc + t.progress, 0) / totalTasks) : 0;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
      <div className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors focus:outline-none">
        <div 
            className="flex items-center gap-4 flex-grow cursor-pointer"
            onClick={() => onSelectProject(project.id)}
        >
            <span className="text-xl font-semibold text-gray-900 hover:text-emerald-600 transition-colors">{project.name}</span>
             <div className="flex-grow max-w-xs flex items-center gap-3 ml-auto">
                <ProgressBar progress={avgProgress} />
                <span className="text-sm font-medium text-gray-600 w-12 text-right">{avgProgress}%</span>
            </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
             <EditableText
                initialValue={project.name}
                onSave={(newValue) => onUpdateProjectName(project.id, newValue)}
                className="hidden" // The trigger is the icon now
                trigger={
                    <button onClick={(e) => e.stopPropagation()} className="p-1 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50">
                        <EditIcon className="w-5 h-5"/>
                    </button>
                }
                inputClassName="text-xl font-semibold bg-white border border-emerald-300 rounded px-2 py-1"
            />
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50">
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-gray-200">
            <div className="px-4 py-2 grid grid-cols-10 gap-4 items-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                <div className="col-span-10 sm:col-span-5">Task Name</div>
                <div className="col-span-5 sm:col-span-2">Timeline</div>
                <div className="col-span-5 sm:col-span-3">Assignments & Progress</div>
            </div>
            <div className="divide-y divide-gray-200/70">
                {project.tasks.map(task => 
                    <TaskListItem 
                        key={task.id} 
                        task={task} 
                        project={project} 
                        members={members}
                        statuses={statuses}
                        level={0}
                        onSelectProject={onSelectProject}
                    />)}
            </div>
        </div>
      )}
    </div>
  );
};


const ProjectListView: React.FC<ProjectListViewProps> = ({ projects, members, statuses, onUpdateProjectName, onSelectProject }) => {
  return (
    <div className="space-y-6">
      {projects.map(project => (
        <ProjectItem 
            key={project.id} 
            project={project}
            members={members}
            statuses={statuses}
            onUpdateProjectName={onUpdateProjectName}
            onSelectProject={onSelectProject}
        />
      ))}
    </div>
  );
};

export default ProjectListView;