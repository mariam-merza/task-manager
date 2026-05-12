import { useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/context/AuthContext";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { currentUser } = useAuthContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
    }
  }, [currentUser, setLocation]);

  if (!currentUser) return null;

  return <>{children}</>;
}
