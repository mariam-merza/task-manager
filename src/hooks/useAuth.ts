import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type User = z.infer<typeof userSchema>;
export type Session = { id: string; name: string; email: string };

export function useAuth() {
  const [users, setUsers] = useLocalStorage<User[]>("tm_users", []);
  const [currentUser, setCurrentUser] = useLocalStorage<Session | null>("tm_session", null);

  const signup = useCallback((data: Omit<User, "id">) => {
    if (users.some(u => u.email === data.email)) {
      throw new Error("User with this email already exists");
    }

    const newUser: User = {
      ...data,
      id: crypto.randomUUID(),
    };

    setUsers([...users, newUser]);

    const session = { id: newUser.id, name: newUser.name, email: newUser.email };
    setCurrentUser(session);
    return session;
  }, [users, setUsers, setCurrentUser]);

  const login = useCallback((email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const session = { id: user.id, name: user.name, email: user.email };
    setCurrentUser(session);
    return session;
  }, [users, setCurrentUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  return {
    currentUser,
    signup,
    login,
    logout,
  };
}
