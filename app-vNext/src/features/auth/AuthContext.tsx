import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isDevReviewMode() {
  const isLoopback = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(window.location.hostname);
  if (!import.meta.env.DEV && !isLoopback) return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("visualQa") === "1" || params.get("demo") === "1";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode] = useState(isDevReviewMode);

  useEffect(() => {
    if (isDemoMode) {
      setUser({ uid: "local-preview", email: "preview@easylife.local" } as User);
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let isActive = true;

    setPersistence(auth, browserLocalPersistence)
      .catch(() => {
        // Auth still works without local persistence; the session may just be shorter.
      })
      .finally(() => {
        if (!isActive) return;
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser);
          setIsLoading(false);
        });
      });

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, [isDemoMode]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isDemoMode,
    }),
    [user, isLoading, isDemoMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
