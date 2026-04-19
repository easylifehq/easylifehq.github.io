import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createApplication,
  removeApplication,
  saveGeneratedDraft,
  subscribeToApplications,
  subscribeToGeneratedDrafts,
  updateApplication,
  type ApplicationDraft,
  type ApplicationRecord,
  type GeneratedDraftRecord,
} from "@/lib/firestore/applications";
import { useAuth } from "@/features/auth/AuthContext";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";

type EasyPipelineContextValue = {
  applications: ApplicationRecord[];
  drafts: GeneratedDraftRecord[];
  isLoading: boolean;
  error: string;
  addApplication: (draft: ApplicationDraft) => Promise<void>;
  saveApplication: (applicationId: string, draft: ApplicationDraft) => Promise<void>;
  deleteApplication: (applicationId: string) => Promise<void>;
  saveEmailDraft: (draft: Omit<GeneratedDraftRecord, "id" | "createdAt">) => Promise<void>;
};

const EasyPipelineContext = createContext<EasyPipelineContextValue | undefined>(undefined);

export function EasyPipelineProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [drafts, setDrafts] = useState<GeneratedDraftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setApplications([]);
      setDrafts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribeApps = subscribeToApplications(
      user.uid,
      (nextApplications) => {
        setApplications(nextApplications);
        setIsLoading(false);
        setError("");
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
        setIsLoading(false);
      }
    );

    const unsubscribeDrafts = subscribeToGeneratedDrafts(
      user.uid,
      (nextDrafts) => {
        setDrafts(nextDrafts);
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
      }
    );

    return () => {
      unsubscribeApps();
      unsubscribeDrafts();
    };
  }, [user]);

  async function addApplicationForUser(draft: ApplicationDraft) {
    if (!user) return;
    await createApplication(user.uid, draft);
  }

  async function saveApplicationForUser(applicationId: string, draft: ApplicationDraft) {
    if (!user) return;
    await updateApplication(user.uid, applicationId, draft);
  }

  async function deleteApplicationForUser(applicationId: string) {
    if (!user) return;
    await removeApplication(user.uid, applicationId);
  }

  async function saveEmailDraftForUser(draft: Omit<GeneratedDraftRecord, "id" | "createdAt">) {
    if (!user) return;
    await saveGeneratedDraft(user.uid, draft);
  }

  const value = useMemo(
    () => ({
      applications,
      drafts,
      isLoading,
      error,
      addApplication: addApplicationForUser,
      saveApplication: saveApplicationForUser,
      deleteApplication: deleteApplicationForUser,
      saveEmailDraft: saveEmailDraftForUser,
    }),
    [applications, drafts, isLoading, error]
  );

  return <EasyPipelineContext.Provider value={value}>{children}</EasyPipelineContext.Provider>;
}

export function useEasyPipeline() {
  const context = useContext(EasyPipelineContext);

  if (!context) {
    throw new Error("useEasyPipeline must be used inside EasyPipelineProvider");
  }

  return context;
}
