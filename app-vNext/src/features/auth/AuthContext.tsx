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
import { auth, firebaseConfigured } from "@/lib/firebase/client";
import { resolveReviewRuntimeMode, type ReviewRuntimeMode } from "@/lib/runtime/reviewRuntime";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
  isAuditMode: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewRuntime] = useState<ReviewRuntimeMode>(() => resolveReviewRuntimeMode({
    hostname: window.location.hostname,
    search: window.location.search,
  }));
  const isDemoMode = reviewRuntime !== "none";
  const isAuditMode = reviewRuntime === "audit";

  useEffect(() => {
    if (isDemoMode) {
      setUser({ uid: "local-preview", email: "preview@easylife.local" } as User);
      setIsLoading(false);
      return;
    }

    if (!firebaseConfigured) {
      setUser(null);
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
      isAuditMode,
    }),
    [user, isLoading, isDemoMode, isAuditMode]
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
