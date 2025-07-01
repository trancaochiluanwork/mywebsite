import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppTab, ViewMode, Project, Member, Status, Task } from './types';
import { MOCK_PROJECTS, MOCK_MEMBERS, MOCK_STATUSES } from './constants';
import Header from './components/Header';
import ProjectListView from './components/ProjectListView';
import GanttChartView from './components/GanttChartView';
import SettingsView from './components/SettingsView';
import TaskView from './components/TaskView';
import ProjectManagementView from './components/ProjectManagementView';
import ProjectDetailView from './components/ProjectDetailView';
import TaskDetailModal from './components/TaskDetailModal';
import EditTaskModal from './components/EditTaskModal';
import AddTaskModal from './components/AddTaskModal';
import EditProjectModal from './components/EditProjectModal';
import Infographics from './components/Infographics';
import EditStatusModal from './components/EditStatusModal';

// Helper function to recursively find and update a task
const updateTaskInTree = (tasks: Task[], updatedTask: Task): Task[] => {
  return tasks.map(task => {
    if (task.id === updatedTask.id) {
      return { ...updatedTask, updatedAt: new Date() };
    }
    if (task.subtasks) {
      return { ...task, subtasks: updateTaskInTree(task.subtasks, updatedTask) };
    }
    return task;
  });
};

// More robust helper to recursively delete a task
const deleteTaskInTree = (tasks: Task[], taskId: string): Task[] => {
  return tasks
    .filter(task => task.id !== taskId)
    .map(task => {
        if (task.subtasks && task.subtasks.length > 0) {
            return { ...task, subtasks: deleteTaskInTree(task.subtasks, taskId) };
        }
        return task;
    });
};


// Helper to recursively add a task
const addTaskToTree = (tasks: Task[], newTask: Task, parentId?: string): Task[] => {
  if (!parentId) {
    return [...tasks, newTask]; // Add to root of this list
  }
  return tasks.map(task => {
    if (task.id === parentId) {
      const newSubtasks = task.subtasks ? [...task.subtasks, newTask] : [newTask];
      return { ...task, subtasks: newSubtasks };
    }
    if (task.subtasks && task.subtasks.length > 0) {
      return { ...task, subtasks: addTaskToTree(task.subtasks, newTask, parentId) };
    }
    return task;
  });
};

// Helper to find a single task from all projects to get its original state
const findTaskGlobal = (projects: Project[], taskId: string): Task | null => {
  for (const project of projects) {
    const find = (tasks: Task[]): Task | null => {
        for (const task of tasks) {
            if (task.id === taskId) return task;
            if (task.subtasks) {
                const found = find(task.subtasks);
                if (found) return found;
            }
        }
        return null;
    }
    const foundTask = find(project.tasks);
    if(foundTask) return foundTask;
  }
  return null;
}

// Recursive helper to unassign member
const unassignMemberInTree = (tasks: Task[], memberId: string): Task[] => {
    return tasks.map(task => ({
        ...task,
        assigneeIds: task.assigneeIds.filter(id => id !== memberId),
        subtasks: task.subtasks ? unassignMemberInTree(task.subtasks, memberId) : []
    }));
};

// Rewritten helper to update dates and shift subtasks
const updateTaskDatesInTree = (tasks: Task[], taskId: string, newStart: Date, newEnd: Date, startDiffMs: number): Task[] => {
    return tasks.map(task => {
        if (task.id === taskId) {
            const updatedTask: Task = {
                ...task,
                start: newStart,
                end: newEnd,
                updatedAt: new Date(),
            };
            // If the task was moved (not just resized), shift its children
            if (startDiffMs !== 0 && updatedTask.subtasks) {
                const shiftChildren = (subtasks: Task[]): Task[] => {
                    return subtasks.map(child => ({
                        ...child,
                        start: new Date(child.start.getTime() + startDiffMs),
                        end: new Date(child.end.getTime() + startDiffMs),
                        subtasks: child.subtasks ? shiftChildren(child.subtasks) : [],
                    }));
                };
                updatedTask.subtasks = shiftChildren(updatedTask.subtasks);
            }
            return updatedTask;
        }
        if (task.subtasks) {
            return { ...task, subtasks: updateTaskDatesInTree(task.subtasks, taskId, newStart, newEnd, startDiffMs) };
        }
        return task;
    });
};


function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const ganttContainerRef = useRef<HTMLDivElement>(null);

  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [statuses, setStatuses] = useState<Status[]>(MOCK_STATUSES);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewingTask, setViewingTask] = useState<{task: Task, project: Project} | null>(null);
  const [editingTask, setEditingTask] = useState<{task: Task, project: Project} | null>(null);
  const [addTaskModalState, setAddTaskModalState] = useState<{ isOpen: boolean; projectId: string; parentTaskId?: string; } | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);


  const handleToggleFullScreen = useCallback(() => {
    const element = ganttContainerRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      const ganttView = element.querySelector('.gantt-chart-view-container');
      if(ganttView) {
          ganttView.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
      }
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);
  
  // --- Data Update Handlers ---

  const handleUpdateProjectName = (projectId: string, newName: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p));
  };
  
  const handleUpdateMember = (memberId: string, field: 'name' | 'email', value: string) => {
     setMembers(prev => prev.map(m => m.id === memberId ? { ...m, [field]: value } : m));
  };
  
  const handleUpdateStatus = (updatedStatus: Status) => {
     setStatuses(prev => prev.map(s => s.id === updatedStatus.id ? updatedStatus : s));
     handleCloseEditStatusModal();
  };
  
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>, projectId: string, parentTaskId?: string) => {
     const now = new Date();
     const taskWithId: Task = { ...newTaskData, subtasks: [], id: `task-${Date.now()}`, createdAt: now, updatedAt: now };
     
     setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            const newTasks = addTaskToTree(p.tasks, taskWithId, parentTaskId);
            return { ...p, tasks: newTasks };
        }
        return p;
     }));
     
     if(addTaskModalState?.isOpen){
        handleCloseAddTaskModal();
     }
  };

  const handleAddProject = (name: string) => {
    if (!name.trim()) {
      alert("Project name cannot be empty.");
      return;
    }
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      tasks: [],
    };
    setProjects(prev => [newProject, ...prev]);
  };
  
  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    handleDeselectProject(); // Go back to dashboard
    handleCloseEditProjectModal(); // Close modal if open
  };

  const handleAddMember = (newMemberData: Omit<Member, 'id' | 'avatar'>) => {
    const newMember: Member = {
      ...newMemberData,
      id: `mem-${Date.now()}`,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`
    };
    setMembers(prev => [...prev, newMember]);
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    setProjects(prevProjects => prevProjects.map(p => ({
        ...p,
        tasks: unassignMemberInTree(p.tasks, memberId)
    })));
  };

  const handleAddStatus = (newStatusData: Omit<Status, 'id'>) => {
    const newStatus: Status = {
      ...newStatusData,
      id: `status-${Date.now()}`,
    };
    setStatuses(prev => [...prev, newStatus]);
  };

  const handleDeleteStatus = (statusId: string) => {
      setStatuses(prev => prev.filter(s => s.id !== statusId));
  };

  const handleUpdateTask = (projectId: string, updatedTask: Task) => {
    setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === projectId) {
            return { ...p, tasks: updateTaskInTree(p.tasks, updatedTask) };
        }
        return p;
    }));
  };

  const handleUpdateTaskDates = (projectId: string, taskId: string, newStart: Date, newEnd: Date) => {
    const originalTask = findTaskGlobal(projects, taskId);
    if (!originalTask) return;

    const startDiffMs = newStart.getTime() - originalTask.start.getTime();

    setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === projectId) {
            return { ...p, tasks: updateTaskDatesInTree(p.tasks, taskId, newStart, newEnd, startDiffMs) };
        }
        return p;
    }));
  };
  
  const handleDeleteTask = (projectId: string, taskId: string) => {
      setProjects(prevProjects => prevProjects.map(p => {
          if (p.id === projectId) {
              return { ...p, tasks: deleteTaskInTree(p.tasks, taskId) };
          }
          return p;
      }));
      handleCloseEditModal();
  };


  // --- Navigation and Modal Handlers ---

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };
  
  const handleDeselectProject = () => {
    setSelectedProjectId(null);
  };

  const handleViewTask = (task: Task, project: Project) => {
    setViewingTask({ task, project });
  };

  const handleCloseTaskModal = () => {
    setViewingTask(null);
  };

  const handleEditTask = (task: Task, project: Project) => {
    setEditingTask({ task, project });
  };
  
  const handleCloseEditModal = () => {
    setEditingTask(null);
  };

  const handleOpenAddTaskModal = (projectId: string, parentTaskId?: string) => {
    setAddTaskModalState({ isOpen: true, projectId, parentTaskId });
  };
  
  const handleCloseAddTaskModal = () => {
    setAddTaskModalState(null);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleCloseEditProjectModal = () => {
    setEditingProject(null);
  };
  
  const handleEditStatus = (status: Status) => {
    setEditingStatus(status);
  };

  const handleCloseEditStatusModal = () => {
    setEditingStatus(null);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  if (selectedProject) {
    return (
       <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <ProjectDetailView 
                project={selectedProject}
                members={members}
                statuses={statuses}
                onBack={handleDeselectProject}
                onEditTask={(task) => handleEditTask(task, selectedProject)}
                onUpdateTask={handleUpdateTask}
                onUpdateTaskDates={handleUpdateTaskDates}
                onTaskClick={(task) => handleViewTask(task, selectedProject)}
                onAddTask={handleOpenAddTaskModal}
                onEditProject={() => handleEditProject(selectedProject)}
            />
        </div>
        {viewingTask && (
          <TaskDetailModal
            task={viewingTask.task}
            project={viewingTask.project}
            members={members}
            statuses={statuses}
            onClose={handleCloseTaskModal}
          />
        )}
        {editingTask && (
          <EditTaskModal
            task={editingTask.task}
            project={editingTask.project}
            members={members}
            statuses={statuses}
            onClose={handleCloseEditModal}
            onSave={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        )}
        {addTaskModalState?.isOpen && (
            <AddTaskModal
                onClose={handleCloseAddTaskModal}
                onAddTask={handleAddTask}
                projectId={addTaskModalState.projectId}
                parentTaskId={addTaskModalState.parentTaskId}
                members={members}
                statuses={statuses}
            />
        )}
        {editingProject && (
            <EditProjectModal
                project={editingProject}
                onClose={handleCloseEditProjectModal}
                onSaveName={handleUpdateProjectName}
                onDelete={handleDeleteProject}
            />
        )}
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return <SettingsView 
                    members={members} 
                    statuses={statuses} 
                    onUpdateMember={handleUpdateMember}
                    onUpdateStatus={handleUpdateStatus}
                    onAddMember={handleAddMember}
                    onAddStatus={handleAddStatus}
                    onDeleteMember={handleDeleteMember}
                    onDeleteStatus={handleDeleteStatus}
                    onEditStatus={handleEditStatus}
                />;
      case 'tasks':
        return (
            <TaskView 
                projects={projects} 
                members={members} 
                statuses={statuses}
                onAddTask={handleAddTask}
                onSelectProject={handleSelectProject}
            />
        );
       case 'project-management':
        return <ProjectManagementView
                    projects={projects}
                    statuses={statuses}
                    onAddProject={handleAddProject}
                    onSelectProject={handleSelectProject}
                />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            <Infographics projects={projects} statuses={statuses} />
            <div ref={ganttContainerRef} className={isFullScreen ? "bg-gray-100" : ""}>
                {viewMode === 'list' 
                ? <ProjectListView 
                    projects={projects} 
                    members={members}
                    statuses={statuses}
                    onUpdateProjectName={handleUpdateProjectName}
                    onSelectProject={handleSelectProject}
                    /> 
                : <GanttChartView 
                    projects={projects} 
                    isFullScreen={isFullScreen}
                    statuses={statuses}
                    onTaskClick={(task, projectId) => {
                        const project = projects.find(p => p.id === projectId);
                        if (project) {
                            handleViewTask(task, project);
                        }
                    }}
                    onUpdateTaskDates={(projectId, taskId, start, end) => handleUpdateTaskDates(projectId, taskId, start, end)}
                    />}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onToggleFullScreen={handleToggleFullScreen}
          isFullScreen={isFullScreen}
        />
        <main className="mt-6">
          {renderContent()}
        </main>
      </div>
      {viewingTask && !selectedProject && (
        <TaskDetailModal
          task={viewingTask.task}
          project={viewingTask.project}
          members={members}
          statuses={statuses}
          onClose={handleCloseTaskModal}
        />
      )}
       {editingTask && (
          <EditTaskModal
            task={editingTask.task}
            project={editingTask.project}
            members={members}
            statuses={statuses}
            onClose={handleCloseEditModal}
            onSave={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        )}
        {addTaskModalState?.isOpen && (
            <AddTaskModal
                onClose={handleCloseAddTaskModal}
                onAddTask={handleAddTask}
                projectId={addTaskModalState.projectId}
                parentTaskId={addTaskModalState.parentTaskId}
                members={members}
                statuses={statuses}
            />
        )}
        {editingStatus && (
            <EditStatusModal 
                status={editingStatus}
                onClose={handleCloseEditStatusModal}
                onSave={handleUpdateStatus}
            />
        )}
    </div>
  );
}

export default App;