import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useAuth } from "./AuthContext";

export function AuthenticatedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <LoadingState
        label="Checking your account..."
        detail="No data is changing while EasyLife checks your session."
        delayedActionLabel="Open sign in"
        delayedActionTo="/login"
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
