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

export function EasyContactsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
