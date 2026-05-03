import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  archiveContact,
  createContact,
  subscribeToContacts,
  updateContact,
  type ContactDraft,
  type ContactRecord,
} from "@/lib/firestore/contacts";
import { useAuth } from "@/features/auth/AuthContext";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";

type EasyContactsContextValue = {
  contacts: ContactRecord[];
  isLoading: boolean;
  error: string;
  addContact: (draft: ContactDraft) => Promise<void>;
  saveContact: (contactId: string, draft: ContactDraft) => Promise<void>;
  archiveCurrentContact: (contactId: string) => Promise<void>;
};

const EasyContactsContext = createContext<EasyContactsContextValue | undefined>(undefined);

function isVisualQaMode() {
  if (!import.meta.env.DEV) return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("visualQa") === "1" || params.get("demo") === "1";
}

const visualQaContacts: ContactRecord[] = [
  {
    id: "visual-contact-maya",
    fullName: "Maya Chen",
    relationship: "Friend",
    company: "Northline Studio",
    role: "Producer",
    email: "maya@example.com",
    phone: "",
    linkedinUrl: "",
    source: "Friday plans",
    status: "warm",
    relatedOpportunityIds: [],
    lastContactedAt: "2026-04-28",
    nextFollowUpAt: "2026-05-03",
    notes: "Reply today, then move the thread out of the overdue lane.",
    archived: false,
    createdAt: new Date("2026-04-20T10:00:00"),
    updatedAt: new Date("2026-05-03T09:00:00"),
  },
  {
    id: "visual-contact-jordan",
    fullName: "Jordan Lee",
    relationship: "Recruiter",
    company: "Cedar Labs",
    role: "Talent partner",
    email: "jordan@example.com",
    phone: "",
    linkedinUrl: "",
    source: "Pipeline",
    status: "active",
    relatedOpportunityIds: ["visual-app-cedar"],
    lastContactedAt: "2026-05-01",
    nextFollowUpAt: "2026-05-06",
    notes: "Send a concise follow-up after the product interview.",
    archived: false,
    createdAt: new Date("2026-04-22T14:00:00"),
    updatedAt: new Date("2026-05-01T16:15:00"),
  },
];

export function EasyContactsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisualQaMode()) {
      setContacts(visualQaContacts);
      setIsLoading(false);
      setError("");
      return;
    }

    if (!user) {
      setContacts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToContacts(
      user.uid,
      (nextContacts) => {
        setContacts(nextContacts.filter((contact) => !contact.archived));
        setIsLoading(false);
        setError("");
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  async function addContactForUser(draft: ContactDraft) {
    if (!user) return;
    await createContact(user.uid, draft);
  }

  async function saveContactForUser(contactId: string, draft: ContactDraft) {
    if (!user) return;
    await updateContact(user.uid, contactId, draft);
  }

  async function archiveContactForUser(contactId: string) {
    if (!user) return;
    await archiveContact(user.uid, contactId);
  }

  const value = useMemo(
    () => ({
      contacts,
      isLoading,
      error,
      addContact: addContactForUser,
      saveContact: saveContactForUser,
      archiveCurrentContact: archiveContactForUser,
    }),
    [contacts, isLoading, error]
  );

  return <EasyContactsContext.Provider value={value}>{children}</EasyContactsContext.Provider>;
}

export function useEasyContacts() {
  const context = useContext(EasyContactsContext);

  if (!context) {
    throw new Error("useEasyContacts must be used inside EasyContactsProvider");
  }

  return context;
}
