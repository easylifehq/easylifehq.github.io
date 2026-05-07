import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useEasyNotes } from "@/features/easynotes/EasyNotesContext";

export function EasyNotesNewPage() {
  const navigate = useNavigate();
  const { addNote } = useEasyNotes();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    void addNote().then((noteId) => {
      navigate(noteId ? `/app/easynotes/${noteId}` : "/app/easynotes", { replace: true });
    });
  }, [addNote, navigate]);

  return <LoadingState label="Saving a place for this thought..." />;
}
