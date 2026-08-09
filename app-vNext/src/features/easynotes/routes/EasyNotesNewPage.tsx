import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingState } from "@/components/feedback/LoadingState";
import { withReviewMode } from "@/features/coreloop/demo/reviewRoute";
import { useEasyNotes } from "@/features/easynotes/EasyNotesContext";

export function EasyNotesNewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNote } = useEasyNotes();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    void addNote().then((noteId) => {
      navigate(withReviewMode(noteId ? `/app/easynotes/${noteId}` : "/app/easynotes", location.search), { replace: true });
    }).catch(() => {
      navigate(withReviewMode("/app/easynotes", location.search), { replace: true });
    });
  }, [addNote, location.search, navigate]);

  return <LoadingState label="Saving a place for this thought..." />;
}
