import { createContext, useContext, useCallback, ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type User = z.infer<typeof userSchema>;
export type Session = { id: string; name: string; email: string };

interface AuthContextValue {
  currentUser: Session | null;
  signup: (data: Omit<User, "id">) => Session;
  login: (email: string, password: string) => Session;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useLocalStorage<User[]>("tm_users", []);
  const [currentUser, setCurrentUser] = useLocalStorage<Session | null>("tm_session", null);

  const signup = useCallback((data: Omit<User, "id">): Session => {
    if (users.some((u: User) => u.email === data.email)) {
      throw new Error("User with this email already exists");
    }

    const newUser: User = {
      ...data,
      id: crypto.randomUUID(),
    };

    setUsers([...users, newUser]);

    const session: Session = { id: newUser.id, name: newUser.name, email: newUser.email };
    setCurrentUser(session);
    return session;
  }, [users, setUsers, setCurrentUser]);

  const login = useCallback((email: string, password: string): Session => {
    const user = users.find((u: User) => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const session: Session = { id: user.id, name: user.name, email: user.email };
    setCurrentUser(session);
    return session;
  }, [users, setCurrentUser]);

  const logout = useCallback((): void => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
