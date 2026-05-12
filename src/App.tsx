import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { TaskManager } from "@/pages/TaskManager";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: any }) {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
    }
  }, [currentUser, setLocation]);

  if (!currentUser) return null;

  return <Component />;
}

function PublicRoute({ component: Component }: { component: any }) {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (currentUser) {
      setLocation("/");
    }
  }, [currentUser, setLocation]);

  if (currentUser) return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        {() => <PublicRoute component={Login} />}
      </Route>
      <Route path="/signup">
        {() => <PublicRoute component={Signup} />}
      </Route>
      <Route path="/">
        {() => <ProtectedRoute component={TaskManager} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
