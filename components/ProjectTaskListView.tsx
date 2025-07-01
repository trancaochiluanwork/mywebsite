import React from 'react';
import { Project, Task, Member, Status } from '../types';
import EditableText from './EditableText';
import { EditIcon, PlusCircleIcon } from './Icons';

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
);

const TaskListItem: React.FC<{
    task: Task; 
    project: Project;
    members: Member[];
    statuses: Status[];
    level: number;
    onUpdateTask: (projectId: string, task: Task) => void;
    onEditTask: (task: Task) => void;
    onAddTask: (projectId: string, parentTaskId?: string) => void;
}> = ({ task, project, members, statuses, level, onUpdateTask, onEditTask, onAddTask }) => {
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const assignedMembers = task.assigneeIds.map(id => members.find(m => m.id === id)).filter(Boolean) as Member[];
    const status = statuses.find(s => s.id === task.statusId);
    
    const handleNameSave = (newName: string) => {
        onUpdateTask(project.id, {...task, name: newName});
    }

    return (
        <>
            <div className="grid grid-cols-12 gap-4 items-center py-2 px-4 hover:bg-gray-100/50 rounded-lg transition-colors group">
                {/* Task Name */}
                <div className="col-span-12 sm:col-span-4 flex items-center">
                    <div style={{ paddingLeft: `${level * 2}rem` }} className="flex-grow flex items-center gap-3">
                         <span className={`w-2 h-2 rounded-full ${status?.color || 'bg-gray-300'}`} title={status?.label}></span>
                         <EditableText 
                            initialValue={task.name}
                            onSave={handleNameSave}
                            className="text-gray-800"
                            inputClassName="w-full bg-white border border-emerald-300 rounded px-2 py-1 text-sm"
                        />
                    </div>
                </div>
                {/* Timeline */}
                <div className="col-span-6 sm:col-span-2 text-sm text-gray-500">{formatDate(task.start)} - {formatDate(task.end)}</div>
                {/* Assignments & Progress */}
                <div className="col-span-6 sm:col-span-4 flex items-center gap-4">
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
                {/* Actions */}
                <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onAddTask(project.id, task.id)} title="Add Sub-task" className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                        <PlusCircleIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => onEditTask(task)} title="Edit Task" className="p-2 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50">
                        <EditIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
            {task.subtasks?.map(subtask => (
                <TaskListItem key={subtask.id} task={subtask} project={project} members={members} statuses={statuses} level={level + 1} onUpdateTask={onUpdateTask} onEditTask={onEditTask} onAddTask={onAddTask} />
            ))}
        </>
    );
};


interface ProjectTaskListViewProps {
    project: Project;
    members: Member[];
    statuses: Status[];
    onUpdateTask: (projectId: string, task: Task) => void;
    onEditTask: (task: Task) => void;
    onAddTask: (projectId: string, parentTaskId?: string) => void;
}

const ProjectTaskListView: React.FC<ProjectTaskListViewProps> = ({project, members, statuses, onUpdateTask, onEditTask, onAddTask}) => {
    return (
        <div>
            <div className="px-4 py-2 grid grid-cols-12 gap-4 items-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-t border-gray-200 rounded-t-md">
                <div className="col-span-12 sm:col-span-4">Task Name</div>
                <div className="col-span-6 sm:col-span-2">Timeline</div>
                <div className="col-span-6 sm:col-span-4">Assignments & Progress</div>
                <div className="col-span-12 sm:col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-200/70">
                {project.tasks.length > 0 ? project.tasks.map(task => 
                    <TaskListItem 
                        key={task.id} 
                        task={task} 
                        project={project} 
                        members={members}
                        statuses={statuses}
                        level={0}
                        onUpdateTask={onUpdateTask}
                        onEditTask={onEditTask}
                        onAddTask={onAddTask}
                    />)
                : <p className="text-center text-gray-500 py-8">This project has no tasks yet.</p>}
            </div>
             <div className="p-4 border-t border-gray-200">
                <button 
                    onClick={() => onAddTask(project.id)}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-md transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5"/>
                    Add New Task to Project
                </button>
             </div>
        </div>
    )
}

export default ProjectTaskListView;
