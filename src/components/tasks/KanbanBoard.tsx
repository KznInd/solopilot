'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusIcon } from '@heroicons/react/24/outline';
import AddTaskForm from './AddTaskForm';
import TaskModal from './TaskModal';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee?: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

interface KanbanBoardProps {
  projectId: string;
}

const initialColumns: Column[] = [
  {
    id: 'TODO',
    title: 'À faire',
    tasks: [],
    color: 'border-slate-500'
  },
  {
    id: 'IN_PROGRESS',
    title: 'En cours',
    tasks: [],
    color: 'border-blue-500'
  },
  {
    id: 'IN_REVIEW',
    title: 'En revue',
    tasks: [],
    color: 'border-yellow-500'
  },
  {
    id: 'DONE',
    title: 'Terminé',
    tasks: [],
    color: 'border-green-500'
  }
];

const priorityColors = {
  LOW: 'bg-blue-500/10 text-blue-500 border-blue-200',
  MEDIUM: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  HIGH: 'bg-red-500/10 text-red-500 border-red-200'
};

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      const tasks = await response.json();
      
      const newColumns = initialColumns.map(column => ({
        ...column,
        tasks: tasks.filter((task: Task) => task.status === column.id)
      }));
      
      setColumns(newColumns);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);
    const sourceTasks = [...sourceColumn!.tasks];
    const destTasks = source.droppableId === destination.droppableId 
      ? sourceTasks 
      : [...destColumn!.tasks];
    
    const [removed] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, removed);

    setColumns(columns.map(col => {
      if (col.id === source.droppableId) {
        return { ...col, tasks: sourceTasks };
      }
      if (col.id === destination.droppableId) {
        return { ...col, tasks: destTasks };
      }
      return col;
    }));

    try {
      await fetch(`/api/tasks/${removed.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: destination.droppableId
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <div className="flex justify-end mb-4">
        <AddTaskForm projectId={projectId} onSuccess={fetchTasks} />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col bg-background/50 rounded-lg border border-border/50">
              <div className="p-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column.color.replace('border', 'bg')}`} />
                    {column.title}
                  </h3>
                  <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 overflow-y-auto transition-colors ${
                      snapshot.isDraggingOver ? 'bg-primary/5' : ''
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setSelectedTask(task)}
                            className={`group bg-card border rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                              snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                            }`}
                          >
                            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
                                {task.priority === 'LOW' ? 'Basse' : 
                                 task.priority === 'MEDIUM' ? 'Moyenne' : 'Haute'}
                              </span>
                              {task.assignee && (
                                <div className="flex items-center gap-2">
                                  {task.assignee.image ? (
                                    <img
                                      src={task.assignee.image}
                                      alt={task.assignee.name}
                                      className="w-6 h-6 rounded-full ring-2 ring-background"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                                      <span className="text-xs text-primary font-medium">
                                        {task.assignee.name[0]}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
} 