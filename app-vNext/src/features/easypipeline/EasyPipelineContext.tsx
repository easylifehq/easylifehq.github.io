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

function isVisualQaMode() {
  if (!import.meta.env.DEV) return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("visualQa") === "1" || params.get("demo") === "1";
}

const visualQaApplications: ApplicationRecord[] = [
  {
    id: "visual-app-cedar",
    company: "Cedar Labs",
    title: "Product operations lead",
    status: "interviewing",
    priority: "high",
    offerResponse: "",
    dateApplied: "2026-04-25",
    nextFollowUp: "2026-05-06",
    location: "Remote",
    link: "",
    notes: "Prep two examples: messy workflow cleanup and mobile-first demo polish.",
    contactName: "Jordan Lee",
    contactEmail: "jordan@example.com",
    createdAt: new Date("2026-04-25T11:00:00"),
    updatedAt: new Date("2026-05-02T15:30:00"),
  },
  {
    id: "visual-app-harbor",
    company: "Harbor Tools",
    title: "Customer systems designer",
    status: "follow_up",
    priority: "medium",
    offerResponse: "",
    dateApplied: "2026-04-21",
    nextFollowUp: "2026-05-04",
    location: "Denver, CO",
    link: "",
    notes: "Send a short follow-up with one relevant portfolio link.",
    contactName: "Priya Shah",
    contactEmail: "priya@example.com",
    createdAt: new Date("2026-04-21T13:20:00"),
    updatedAt: new Date("2026-05-01T09:10:00"),
  },
  {
    id: "visual-app-northstar",
    company: "Northstar Kitchen",
    title: "Operations coordinator",
    status: "need_to_apply",
    priority: "low",
    offerResponse: "",
    dateApplied: "",
    nextFollowUp: "2026-05-08",
    location: "Atlanta, GA",
    link: "",
    notes: "Decide whether this is still a fit before drafting.",
    contactName: "",
    contactEmail: "",
    createdAt: new Date("2026-04-30T08:30:00"),
    updatedAt: new Date("2026-04-30T08:30:00"),
  },
];

const visualQaDrafts: GeneratedDraftRecord[] = [
  {
    id: "visual-draft-cedar",
    subject: "Thanks for the product operations conversation",
    body: "Hi Jordan,\n\nThanks again for making time. I enjoyed talking through practical systems for keeping complex work calm and visible.",
    company: "Cedar Labs",
    applicationId: "visual-app-cedar",
    emailType: "follow_up",
    tone: "warm",
    createdAt: new Date("2026-05-02T16:00:00"),
  },
];

export function EasyPipelineProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [drafts, setDrafts] = useState<GeneratedDraftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisualQaMode()) {
      setApplications(visualQaApplications);
      setDrafts(visualQaDrafts);
      setIsLoading(false);
      setError("");
      return;
    }

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
