const SAFE_CLIENT_DRAFT_ID = /^[a-zA-Z0-9_-]{8,180}$/;

export function workoutSessionDocumentId(clientDraftId: string) {
  if (!SAFE_CLIENT_DRAFT_ID.test(clientDraftId)) {
    throw new Error("Workout draft identity is invalid; the session was not written.");
  }

  return clientDraftId;
}
