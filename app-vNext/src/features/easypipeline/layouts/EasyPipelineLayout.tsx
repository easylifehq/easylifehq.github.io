import { Outlet } from "react-router-dom";
import { AppWorkspaceHeader } from "@/components/navigation/AppWorkspaceHeader";
import { EasyPipelineProvider } from "@/features/easypipeline/EasyPipelineContext";

const links = [
  { to: "/app/easypipeline/dashboard", label: "Dashboard" },
  { to: "/app/easypipeline/stats", label: "Stats" },
  { to: "/app/easypipeline/email", label: "Email Drafts" },
];

export function EasyPipelineLayout() {
  return (
    <EasyPipelineProvider>
      <main className="page-wrap">
        <AppWorkspaceHeader
          appLabel="EasyPipeline"
          title="Your application tracker."
          description="Keep roles moving, follow up on time, and hold the whole search in one lane."
          currentAppHref="/app/easypipeline/dashboard"
          links={links}
        />

        <Outlet />
      </main>
    </EasyPipelineProvider>
  );
}
