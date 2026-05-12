import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { z } from "zod";
import { useAuth } from "./useAuth";

export const priorityEnum = z.enum(["High", "Medium", "Low"]);
export type Priority = z.infer<typeof priorityEnum>;

export const taskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1, "Task name is required"),
  dueDate: z.string(), // ISO date string
  priority: priorityEnum,
  completed: z.boolean().default(false),
  createdAt: z.number()
});

export type Task = z.infer<typeof taskSchema>;
export type NewTask = Omit<Task, "id" | "userId" | "completed" | "createdAt">;

export function useTasks() {
  const { currentUser } = useAuth();
  const [allTasks, setAllTasks] = useLocalStorage<Task[]>("tm_tasks", []);

  // Only show tasks for the current user
  const tasks = useMemo(() => {
    if (!currentUser) return [];
    return allTasks.filter(t => t.userId === currentUser.id);
  }, [allTasks, currentUser]);

  const addTask = useCallback((data: NewTask) => {
    if (!currentUser) return;
    const newTask: Task = {
      ...data,
      id: crypto.randomUUID(),
      userId: currentUser.id,
      completed: false,
      createdAt: Date.now()
    };
    setAllTasks(prev => [...prev, newTask]);
  }, [currentUser, setAllTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    if (!currentUser) return;
    setAllTasks(prev => prev.map(t => 
      t.id === id && t.userId === currentUser.id 
        ? { ...t, ...updates } 
        : t
    ));
  }, [currentUser, setAllTasks]);

  const deleteTask = useCallback((id: string) => {
    if (!currentUser) return;
    setAllTasks(prev => prev.filter(t => !(t.id === id && t.userId === currentUser.id)));
  }, [currentUser, setAllTasks]);

  const toggleTask = useCallback((id: string) => {
    if (!currentUser) return;
    setAllTasks(prev => prev.map(t => 
      t.id === id && t.userId === currentUser.id 
        ? { ...t, completed: !t.completed } 
        : t
    ));
  }, [currentUser, setAllTasks]);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask
  };
}
