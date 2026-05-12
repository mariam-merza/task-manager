import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTasks, Task, priorityEnum } from "@/hooks/useTasks";
import { LiveClock } from "@/components/LiveClock";
import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, LogOut, Search, Trash2, Edit2, X, SortAsc } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const taskFormSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  dueDate: z.date({
    required_error: "A due date is required.",
  }),
  priority: priorityEnum,
});

export function TaskManager() {
  const [, setLocation] = useLocation();
  const { currentUser, logout } = useAuth();
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority">("dueDate");
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: "",
      priority: "Medium",
    },
  });

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    form.reset({
      name: task.name,
      dueDate: new Date(task.dueDate),
      priority: task.priority,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset({
      name: "",
      dueDate: undefined,
      priority: "Medium",
    });
  };

  const onSubmit = (values: z.infer<typeof taskFormSchema>) => {
    if (editingId) {
      updateTask(editingId, {
        name: values.name,
        dueDate: values.dueDate.toISOString(),
        priority: values.priority,
      });
      setEditingId(null);
    } else {
      addTask({
        name: values.name,
        dueDate: values.dueDate.toISOString(),
        priority: values.priority,
      });
    }
    form.reset({
      name: "",
      dueDate: undefined,
      priority: "Medium",
    });
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;
    if (search) {
      filtered = tasks.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
    }

    return [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (sortBy === "dueDate") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        const pValues = { High: 3, Medium: 2, Low: 1 };
        return pValues[b.priority] - pValues[a.priority];
      }
    });
  }, [tasks, search, sortBy]);

  const priorityColors = {
    High: "bg-destructive/15 text-destructive hover:bg-destructive/25",
    Medium: "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25",
    Low: "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25",
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AppLogo size={32} />
            <h1 className="font-semibold text-base sm:text-lg tracking-tight">Planner</h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden sm:block">
              <LiveClock />
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm font-medium text-muted-foreground hidden md:block truncate max-w-[120px]">
                Hi, {currentUser?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground gap-1.5 px-2 sm:px-3"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Log out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-5 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Sidebar / Input Area */}
        <div className="md:col-span-4 space-y-5 md:sticky md:top-20">
          <div className="bg-card rounded-xl border border-border/60 p-4 sm:p-5 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold mb-4">
              {editingId ? "Edit Task" : "New Task"}
            </h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What needs doing?</FormLabel>
                      <FormControl>
                        <Input placeholder="Write a report..." {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-2.5 text-left font-normal bg-background text-xs sm:text-sm",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMM d")
                                ) : (
                                  <span>Pick date</span>
                                )}
                                <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background text-xs sm:text-sm">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-1 flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? "Save Changes" : "Add Task"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" size="icon" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Stats summary — visible on mobile below form, hidden on desktop (shown via layout) */}
          <div className="grid grid-cols-3 gap-2 md:hidden">
            {[
              { label: "Total", value: tasks.length, color: "text-primary" },
              { label: "Done", value: tasks.filter(t => t.completed).length, color: "text-emerald-600" },
              { label: "Pending", value: tasks.filter(t => !t.completed).length, color: "text-amber-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-card rounded-lg border border-border/60 p-3 text-center">
                <p className={cn("text-xl font-bold", color)}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Task List Area */}
        <div className="md:col-span-8 space-y-4 sm:space-y-6">
          {/* Controls */}
          <div className="flex flex-col xs:flex-row gap-3 items-stretch xs:items-center justify-between">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border border-border/60 shadow-sm w-full"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                <SortAsc className="h-4 w-4" />
                <span className="hidden xs:inline">Sort by</span>
              </span>
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger className="w-[130px] h-9 bg-card border border-border/60 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Task count */}
          {filteredAndSortedTasks.length > 0 && (
            <p className="text-xs text-muted-foreground px-0.5">
              {filteredAndSortedTasks.filter(t => !t.completed).length} pending
              {filteredAndSortedTasks.filter(t => t.completed).length > 0 && (
                <span> · {filteredAndSortedTasks.filter(t => t.completed).length} completed</span>
              )}
            </p>
          )}

          {/* List */}
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-14 sm:py-16 text-center text-muted-foreground border-2 border-dashed rounded-xl border-muted bg-card/50"
                >
                  <p className="text-sm">
                    {search ? "No tasks match your search." : "Your planner is empty. Add a task to get started."}
                  </p>
                </motion.div>
              ) : (
                filteredAndSortedTasks.map((task) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    key={task.id}
                    className={cn(
                      "group flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border border-border/60 bg-card shadow-sm transition-all duration-200",
                      task.completed && "opacity-55 bg-muted/20 border-muted/40"
                    )}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="shrink-0 w-5 h-5 rounded-full border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                    />

                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "font-medium text-sm sm:text-base leading-snug transition-colors",
                        task.completed && "line-through text-muted-foreground"
                      )}>
                        {task.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] uppercase font-semibold tracking-wider h-4.5 px-1.5 border-none",
                            priorityColors[task.priority]
                          )}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(task)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 max-w-sm sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete task?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{task.name}" and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTask(task.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
