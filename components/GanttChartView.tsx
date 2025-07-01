import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Project, Task, Status, GanttTimeScale } from '../types';

type AugmentedTask = Task & { level: number; projectId: string; projectName: string };

interface GanttChartViewProps {
  projects: Project[];
  isFullScreen: boolean;
  statuses: Status[];
  onTaskClick: (task: Task, projectId: string) => void;
  onUpdateTaskDates: (projectId: string, taskId: string, start: Date, end: Date) => void;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const differenceInDays = (d1: Date, d2: Date): number => {
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.floor((utc2 - utc1) / MS_PER_DAY);
};

const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return weekNo;
}

const getGanttData = (projects: Project[]) => {
    const allTasks: AugmentedTask[] = projects.flatMap(p => {
        const flattenTasks = (tasks: Task[], level: number): (Task & {level: number})[] => {
            return tasks.flatMap(t => [{...t, level}, ...(t.subtasks ? flattenTasks(t.subtasks, level + 1) : [])]);
        };
        return flattenTasks(p.tasks, 0).map(t => ({ ...t, projectId: p.id, projectName: p.name }));
    });

    if (allTasks.length === 0) {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        return { allTasks: [], startDate: today, endDate: nextMonth, totalDays: 30 };
    }
    const startDates = allTasks.map(t => t.start);
    const endDates = allTasks.map(t => t.end);

    const startDate = new Date(Math.min(...startDates.map(d => d.getTime())));
    startDate.setDate(startDate.getDate() - 2);

    const endDate = new Date(Math.max(...endDates.map(d => d.getTime())));
    endDate.setDate(endDate.getDate() + 2);

    const totalDays = differenceInDays(startDate, endDate) + 1;

    return { allTasks, startDate, endDate, totalDays };
}

const GanttChartLegend: React.FC<{statuses: Status[]}> = ({ statuses }) => (
    <div className="flex items-center justify-center gap-4 py-2 px-4 bg-gray-100 rounded-b-lg border-t border-gray-200">
        <span className="text-xs font-semibold text-gray-600">Legend:</span>
        {statuses.map(status => (
            <div key={status.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                <span className="text-xs text-gray-600">{status.label}</span>
            </div>
        ))}
    </div>
)

const GanttChartView: React.FC<GanttChartViewProps> = ({ projects, isFullScreen, statuses, onTaskClick, onUpdateTaskDates }) => {
    const { allTasks, startDate, endDate, totalDays } = useMemo(() => getGanttData(projects), [projects]);
    const [timeScale, setTimeScale] = useState<GanttTimeScale>('day');
    const ganttGridRef = useRef<HTMLDivElement>(null);

    const [dragState, setDragState] = useState<{
        type: 'move' | 'resize-left' | 'resize-right';
        task: AugmentedTask;
        startX: number; // Mouse start X
        initialLeft: number;
        initialWidth: number;
    } | null>(null);

    const getDayWidth = () => {
        switch(timeScale) {
            case 'month': return 15;
            case 'week': return 25;
            case 'day': default: return 40;
        }
    }
    const DAY_WIDTH = getDayWidth();

    const handleMouseDown = (e: React.MouseEvent, task: AugmentedTask, type: 'move' | 'resize-left' | 'resize-right') => {
        if (!ganttGridRef.current) return;
        e.preventDefault();
        e.stopPropagation();

        const rect = ganttGridRef.current.getBoundingClientRect();
        const offset = differenceInDays(startDate, task.start);
        const duration = differenceInDays(task.start, task.end) + 1;

        setDragState({
            type,
            task,
            startX: e.clientX,
            initialLeft: offset * DAY_WIDTH,
            initialWidth: duration * DAY_WIDTH
        });
    };

    const handleMouseUp = useCallback(() => {
        if (!dragState) return;

        const { task, type, startX, initialLeft, initialWidth } = dragState;
        const finalMouseX = (window as any)._lastClientX || startX; // A bit of a hack to get last mouse position
        const dx = finalMouseX - startX;
        
        let newStart = new Date(task.start);
        let newEnd = new Date(task.end);

        if (type === 'move') {
            const daysChanged = Math.round(dx / DAY_WIDTH);
            newStart.setDate(newStart.getDate() + daysChanged);
            newEnd.setDate(newEnd.getDate() + daysChanged);
        } else if (type === 'resize-right') {
            const daysChanged = Math.round(dx / DAY_WIDTH);
            newEnd.setDate(newEnd.getDate() + daysChanged);
        } else if (type === 'resize-left') {
            const daysChanged = Math.round(dx / DAY_WIDTH);
            newStart.setDate(newStart.getDate() + daysChanged);
        }

        if (newEnd < newStart) { // Prevent invalid dates
             if (type === 'resize-right') newEnd = newStart;
             else newStart = newEnd;
        }

        onUpdateTaskDates(task.projectId, task.id, newStart, newEnd);
        setDragState(null);
    }, [dragState, DAY_WIDTH, onUpdateTaskDates]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        (window as any)._lastClientX = e.clientX; // Store for mouseUp
        if (!dragState || !ganttGridRef.current) return;
        
        const dx = e.clientX - dragState.startX;
        const taskBar = document.getElementById(`task-bar-${dragState.task.id}`);
        if (!taskBar) return;

        if (dragState.type === 'move') {
            taskBar.style.left = `${dragState.initialLeft + dx}px`;
            document.body.style.cursor = 'move';
        } else if (dragState.type === 'resize-right') {
            const newWidth = Math.max(DAY_WIDTH, dragState.initialWidth + dx);
            taskBar.style.width = `${newWidth}px`;
            document.body.style.cursor = 'e-resize';
        } else if (dragState.type === 'resize-left') {
            const newWidth = Math.max(DAY_WIDTH, dragState.initialWidth - dx);
            taskBar.style.width = `${newWidth}px`;
            taskBar.style.left = `${dragState.initialLeft + dx}px`;
            document.body.style.cursor = 'w-resize';
        }
    }, [dragState, DAY_WIDTH]);

    useEffect(() => {
        if (dragState) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.body.style.cursor = 'default';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState, handleMouseMove, handleMouseUp]);


    const renderTimelineHeader = () => {
        const headerData: { name: string; colSpan: number }[] = [];
        let currentDate = new Date(startDate);

        if (timeScale === 'month') {
            while (currentDate <= endDate) {
                const month = currentDate.getMonth();
                const year = currentDate.getFullYear();
                const monthName = currentDate.toLocaleString('default', { month: 'short' });
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                let daysInView = 0;
                let firstDay = new Date(year, month, 1);
                if(firstDay < startDate) firstDay = startDate;
                
                let lastDayInMonth = new Date(year, month, daysInMonth);
                if (lastDayInMonth > endDate) lastDayInMonth = endDate;

                daysInView = differenceInDays(firstDay, lastDayInMonth) + 1;

                if (daysInView > 0) {
                    headerData.push({ name: `${monthName} '${String(year).slice(2)}`, colSpan: daysInView });
                }
                currentDate = new Date(year, month + 1, 1);
            }
        } else if (timeScale === 'week') {
            let week = getWeekNumber(currentDate);
            let year = currentDate.getFullYear();
            let daysInWeek = 0;
            for(let i = 0; i < totalDays; i++) {
                const day = new Date(startDate);
                day.setDate(startDate.getDate() + i);
                const currentWeek = getWeekNumber(day);
                if (currentWeek === week) {
                    daysInWeek++;
                } else {
                    headerData.push({ name: `W${week}`, colSpan: daysInWeek });
                    week = currentWeek;
                    year = day.getFullYear();
                    daysInWeek = 1;
                }
            }
            headerData.push({ name: `W${week}`, colSpan: daysInWeek });
        }
        
        const days = Array.from({ length: totalDays }, (_, i) => {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            return day;
        });

        return (
            <div className="bg-gray-200/80 backdrop-blur-sm">
                <div className="flex border-b border-gray-300">
                    {timeScale !== 'day' ? headerData.map(({ name, colSpan }) => (
                        <div key={name} className="text-center font-semibold text-sm py-1 border-r border-gray-300 text-gray-700" style={{ width: colSpan * DAY_WIDTH }}>
                            {name}
                        </div>
                    )) : <div className="py-1" style={{width: '100%', height: '29px'}}></div>}
                </div>
                 <div className="flex bg-gray-200">
                     {days.map((day, i) => (
                        <div key={i} className={`flex-shrink-0 text-center text-xs w-10 py-1 border-r border-gray-300 ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-gray-300/50' : ''}`} style={{width: DAY_WIDTH}}>
                           {timeScale === 'day' && <span className="text-gray-500">{day.getDate()}</span>}
                           {timeScale === 'week' && <span className="text-gray-500">{day.getDate()}</span>}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderTaskBar = (task: AugmentedTask) => {
        const offset = differenceInDays(startDate, task.start);
        const duration = differenceInDays(task.start, task.end) + 1;

        const left = offset * DAY_WIDTH;
        const width = duration * DAY_WIDTH;
        
        const status = statuses.find(s => s.id === task.statusId);
        const barColor = status ? status.color : 'bg-gray-400';

        const tooltip = `${task.name}\nProject: ${task.projectName}\nDuration: ${duration} days\nProgress: ${task.progress}%`;

        return (
            <div 
                id={`task-bar-${task.id}`}
                title={tooltip}
                onMouseDown={(e) => handleMouseDown(e, task, 'move')}
                className={`absolute h-8 top-1/2 -translate-y-1/2 rounded-md flex items-center group ${barColor} shadow-md border border-black/20`}
                style={{ left: left + 2, width: width - 4, cursor: 'move'}}
            >
                <div 
                    className="h-full rounded-l-md bg-black/20"
                    style={{ width: `${task.progress}%`}}
                />
                <div className="absolute inset-0 px-2 py-1 text-white text-xs font-semibold truncate flex items-center">
                    {task.name}
                </div>
                {/* Resize Handles */}
                <div
                    onMouseDown={(e) => handleMouseDown(e, task, 'resize-left')}
                    className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize"
                />
                <div
                    onMouseDown={(e) => handleMouseDown(e, task, 'resize-right')}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize"
                />
            </div>
        );
    };
    
    const TimeScaleControl = () => {
        const scales: GanttTimeScale[] = ['day', 'week', 'month'];
        return (
            <div className="flex items-center bg-gray-300 rounded-md p-0.5">
                {scales.map(scale => (
                    <button
                        key={scale}
                        onClick={() => setTimeScale(scale)}
                        className={`px-2 py-0.5 rounded text-xs font-semibold capitalize transition-colors ${
                            timeScale === scale ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {scale}
                    </button>
                ))}
            </div>
        )
    };

    const containerHeightClass = isFullScreen ? 'h-screen' : 'h-[70vh]';

    return (
        <div className="gantt-chart-view-container bg-white rounded-lg border border-gray-200 flex flex-col">
            <div className={`overflow-auto flex-grow ${containerHeightClass}`}>
                <div className="relative" style={{ width: 250 + totalDays * DAY_WIDTH, minHeight: '100%' }}>
                    {/* Timeline in the back */}
                    <div ref={ganttGridRef} className="absolute top-0 left-[250px] w-full h-full">
                        <div className="sticky top-0 z-10">
                            {renderTimelineHeader()}
                        </div>
                         <div className="relative">
                            {projects.map(project => (
                                <React.Fragment key={`timeline-project-${project.id}`}>
                                    <div className="h-12 border-b border-t border-gray-300" />
                                    {allTasks.filter(t => t.projectId === project.id).map(task => (
                                        <div key={task.id} className="relative h-12 border-b border-gray-200" onClick={() => onTaskClick(task, task.projectId)}>
                                            {renderTaskBar(task)}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Task list in the front, sticky */}
                    <div className="sticky left-0 top-0 z-20 w-[250px] border-r border-gray-300 bg-gray-50/95 backdrop-blur-sm min-h-full">
                        <div className="sticky top-0 z-10 h-[77px] border-b border-gray-300 flex items-center justify-between p-4 bg-gray-200/95">
                             <h3 className="font-bold text-gray-700">Tasks</h3>
                             <TimeScaleControl />
                        </div>
                         {projects.map(project => (
                            <div key={project.id}>
                                <div className="h-12 flex items-center p-2 bg-gray-200/60 text-sm font-semibold text-emerald-700 truncate sticky top-[77px] z-10 border-b border-t border-gray-300">{project.name}</div>
                                {allTasks.filter(t => t.projectId === project.id).map(task => (
                                    <div key={task.id} className="h-12 flex items-center p-2 border-b border-gray-200 text-sm truncate text-gray-600" style={{paddingLeft: `${1 + task.level * 1.5}rem`}}>
                                        {task.name}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {!isFullScreen && <GanttChartLegend statuses={statuses} />}
        </div>
    );
};

export default GanttChartView;