import React, { useState } from 'react';
import { Project, Status } from '../types';
import { PlusIcon } from './Icons';
import Infographics from './Infographics';

interface ProjectManagementViewProps {
  projects: Project[];
  statuses: Status[];
  onAddProject: (name: string) => void;
  onSelectProject: (projectId: string) => void;
}

const ProjectManagementView: React.FC<ProjectManagementViewProps> = ({ projects, statuses, onAddProject, onSelectProject }) => {
  const [newProjectName, setNewProjectName] = useState('');

  const handleAddClick = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleAddClick();
      }
  }

  return (
    <div className="space-y-8">
        <Infographics projects={projects} statuses={statuses} />

        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Projects</h2>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New Project</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter project name..."
                    className="flex-grow w-full bg-white text-emerald-700 border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                <button
                    onClick={handleAddClick}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Create Project</span>
                </button>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Existing Projects ({projects.length})</h3>
             <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <ul className="divide-y divide-gray-200">
                {projects.length > 0 ? projects.map(project => (
                    <li 
                        key={project.id}
                        onClick={() => onSelectProject(project.id)}
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-emerald-50 transition-colors group"
                    >
                        <div>
                            <p className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">{project.name}</p>
                            <p className="text-sm text-gray-500">{project.tasks.length} tasks</p>
                        </div>
                        <span className="text-sm font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">View Details &rarr;</span>
                    </li>
                )) : (
                  <li className="p-8 text-center text-gray-500">No projects found. Add one above to get started!</li>
                )}
                </ul>
            </div>
        </div>
    </div>
  );
};

export default ProjectManagementView;