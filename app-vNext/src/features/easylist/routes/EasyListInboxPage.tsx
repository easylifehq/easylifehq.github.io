import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
import { TaskComposer } from "@/features/easylist/components/TaskComposer";
import { useEasyList } from "@/features/easylist/EasyListContext";

export function EasyListInboxPage() {
  const { isLoading, error, addTask } = useEasyList();

  if (isLoading) {
    return <LoadingState label="Loading EasyList..." />;
  }

  return (
    <>
      <PageSection
        eyebrow="Capture"
        title="Add tasks fast"
        description="Write each task into its own row, or drop a messy brain dump in and turn it into rows first."
      >
        <TaskComposer onSubmit={addTask} />
      </PageSection>

      {error ? <p className="error-copy">{error}</p> : null}
    </>
  );
}
