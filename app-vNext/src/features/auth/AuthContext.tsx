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
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isLocalPreview =
      import.meta.env.DEV && (params.get("visualQa") === "1" || params.get("demo") === "1");
    if (isLocalPreview) {
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
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
    }),
    [user, isLoading]
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
