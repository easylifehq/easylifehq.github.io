import { lazy, Suspense, type ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthenticatedLayout } from "@/app/layouts/AuthenticatedLayout";
import { MarketingLayout } from "@/app/layouts/MarketingLayout";
import { AuthenticatedRoute } from "@/features/auth/AuthenticatedRoute";

function lazyNamed<TModule extends Record<string, ComponentType>>(
  importer: () => Promise<TModule>,
  exportName: keyof TModule
) {
  return lazy(() => importer().then((module) => ({ default: module[exportName] })));
}

const LoginPage = lazyNamed(
  () => import("@/features/auth/routes/LoginPage"),
  "LoginPage"
);
const EasyCalendarLayout = lazyNamed(
  () => import("@/features/easycalendar/layouts/EasyCalendarLayout"),
  "EasyCalendarLayout"
);
const EasyCalendarDayPage = lazyNamed(
  () => import("@/features/easycalendar/routes/EasyCalendarDayPage"),
  "EasyCalendarDayPage"
);
const EasyCalendarWeekPage = lazyNamed(
  () => import("@/features/easycalendar/routes/EasyCalendarWeekPage"),
  "EasyCalendarWeekPage"
);
const EasyCalendarMonthPage = lazyNamed(
  () => import("@/features/easycalendar/routes/EasyCalendarMonthPage"),
  "EasyCalendarMonthPage"
);
const EasyContactsLayout = lazyNamed(
  () => import("@/features/easycontacts/layouts/EasyContactsLayout"),
  "EasyContactsLayout"
);
const EasyContactsPage = lazyNamed(
  () => import("@/features/easycontacts/routes/EasyContactsPage"),
  "EasyContactsPage"
);
const EasyProjectsLayout = lazyNamed(
  () => import("@/features/easyprojects/layouts/EasyProjectsLayout"),
  "EasyProjectsLayout"
);
const EasyProjectsHomePage = lazyNamed(
  () => import("@/features/easyprojects/routes/EasyProjectsHomePage"),
  "EasyProjectsHomePage"
);
const EasyProjectDetailPage = lazyNamed(
  () => import("@/features/easyprojects/routes/EasyProjectDetailPage"),
  "EasyProjectDetailPage"
);
const EasyProjectsTimelinePage = lazyNamed(
  () => import("@/features/easyprojects/routes/EasyProjectsTimelinePage"),
  "EasyProjectsTimelinePage"
);
const EasyListLayout = lazyNamed(
  () => import("@/features/easylist/layouts/EasyListLayout"),
  "EasyListLayout"
);
const EasyListArchivePage = lazyNamed(
  () => import("@/features/easylist/routes/EasyListArchivePage"),
  "EasyListArchivePage"
);
const EasyListDashboardPage = lazyNamed(
  () => import("@/features/easylist/routes/EasyListDashboardPage"),
  "EasyListDashboardPage"
);
const EasyListInboxPage = lazyNamed(
  () => import("@/features/easylist/routes/EasyListInboxPage"),
  "EasyListInboxPage"
);
const EasyNotesLayout = lazyNamed(
  () => import("@/features/easynotes/layouts/EasyNotesLayout"),
  "EasyNotesLayout"
);
const EasyNotesEditorPage = lazyNamed(
  () => import("@/features/easynotes/routes/EasyNotesEditorPage"),
  "EasyNotesEditorPage"
);
const EasyNotesLibraryPage = lazyNamed(
  () => import("@/features/easynotes/routes/EasyNotesLibraryPage"),
  "EasyNotesLibraryPage"
);
const EasyNotesNewPage = lazyNamed(
  () => import("@/features/easynotes/routes/EasyNotesNewPage"),
  "EasyNotesNewPage"
);
const EasyNotesTrashPage = lazyNamed(
  () => import("@/features/easynotes/routes/EasyNotesTrashPage"),
  "EasyNotesTrashPage"
);
const EasyPipelineLayout = lazyNamed(
  () => import("@/features/easypipeline/layouts/EasyPipelineLayout"),
  "EasyPipelineLayout"
);
const EasyPipelineDashboardPage = lazyNamed(
  () => import("@/features/easypipeline/routes/EasyPipelineDashboardPage"),
  "EasyPipelineDashboardPage"
);
const EasyPipelineEmailPage = lazyNamed(
  () => import("@/features/easypipeline/routes/EasyPipelineEmailPage"),
  "EasyPipelineEmailPage"
);
const EasyPipelineStatsPage = lazyNamed(
  () => import("@/features/easypipeline/routes/EasyPipelineStatsPage"),
  "EasyPipelineStatsPage"
);
const EasyWorkoutLayout = lazyNamed(
  () => import("@/features/easyworkout/layouts/EasyWorkoutLayout"),
  "EasyWorkoutLayout"
);
const EasyWorkoutDashboardPage = lazyNamed(
  () => import("@/features/easyworkout/routes/EasyWorkoutDashboardPage"),
  "EasyWorkoutDashboardPage"
);
const EasyWorkoutRoutinesPage = lazyNamed(
  () => import("@/features/easyworkout/routes/EasyWorkoutRoutinesPage"),
  "EasyWorkoutRoutinesPage"
);
const EasyWorkoutLogPage = lazyNamed(
  () => import("@/features/easyworkout/routes/EasyWorkoutLogPage"),
  "EasyWorkoutLogPage"
);
const EasyStatisticsPage = lazyNamed(
  () => import("@/features/easystatistics/routes/EasyStatisticsPage"),
  "EasyStatisticsPage"
);
const HQPage = lazyNamed(() => import("@/features/hq/routes/HQPage"), "HQPage");
const EasyCalendarMarketingPage = lazyNamed(
  () => import("@/features/marketing/routes/EasyCalendarMarketingPage"),
  "EasyCalendarMarketingPage"
);
const EasyListMarketingPage = lazyNamed(
  () => import("@/features/marketing/routes/EasyListMarketingPage"),
  "EasyListMarketingPage"
);
const EasyNotesMarketingPage = lazyNamed(
  () => import("@/features/marketing/routes/EasyNotesMarketingPage"),
  "EasyNotesMarketingPage"
);
const EasyPipelineMarketingPage = lazyNamed(
  () => import("@/features/marketing/routes/EasyPipelineMarketingPage"),
  "EasyPipelineMarketingPage"
);
const MarketingLandingPage = lazyNamed(
  () => import("@/features/marketing/routes/MarketingLandingPage"),
  "MarketingLandingPage"
);
const SettingsPage = lazyNamed(
  () => import("@/features/settings/routes/SettingsPage"),
  "SettingsPage"
);

export function AppRouter() {
  return (
    <Suspense fallback={<div className="page-wrap">Loading EasyLifeHQ...</div>}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<MarketingLandingPage />} />
          <Route path="/easylist" element={<EasyListMarketingPage />} />
          <Route path="/easynotes" element={<EasyNotesMarketingPage />} />
          <Route path="/easycalendar" element={<EasyCalendarMarketingPage />} />
          <Route path="/easypipeline" element={<EasyPipelineMarketingPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<AuthenticatedRoute />}>
          <Route path="/app" element={<AuthenticatedLayout />}>
            <Route index element={<Navigate to="/app/hq" replace />} />
            <Route path="hq" element={<HQPage />} />
            <Route path="easylist" element={<EasyListLayout />}>
              <Route index element={<Navigate to="/app/easylist/dashboard" replace />} />
              <Route path="dashboard" element={<EasyListDashboardPage />} />
              <Route path="add" element={<EasyListInboxPage />} />
              <Route path="inbox" element={<Navigate to="/app/easylist/add" replace />} />
              <Route path="today" element={<Navigate to="/app/easylist/dashboard" replace />} />
              <Route path="upcoming" element={<Navigate to="/app/easylist/dashboard" replace />} />
              <Route path="archive" element={<EasyListArchivePage />} />
            </Route>
            <Route path="easycalendar" element={<EasyCalendarLayout />}>
              <Route index element={<Navigate to="/app/easycalendar/week" replace />} />
              <Route path="week" element={<EasyCalendarWeekPage />} />
              <Route path="day" element={<EasyCalendarDayPage />} />
              <Route path="month" element={<EasyCalendarMonthPage />} />
            </Route>
            <Route path="easynotes" element={<EasyNotesLayout />}>
              <Route index element={<EasyNotesLibraryPage />} />
              <Route path="new" element={<EasyNotesNewPage />} />
              <Route path="trash" element={<EasyNotesTrashPage />} />
              <Route path=":noteId" element={<EasyNotesEditorPage />} />
            </Route>
            <Route path="easypipeline" element={<EasyPipelineLayout />}>
              <Route index element={<Navigate to="/app/easypipeline/dashboard" replace />} />
              <Route path="dashboard" element={<EasyPipelineDashboardPage />} />
              <Route path="stats" element={<EasyPipelineStatsPage />} />
              <Route path="email" element={<EasyPipelineEmailPage />} />
            </Route>
            <Route path="easycontacts" element={<EasyContactsLayout />}>
              <Route index element={<EasyContactsPage />} />
            </Route>
            <Route path="easyprojects" element={<EasyProjectsLayout />}>
              <Route index element={<EasyProjectsHomePage />} />
              <Route path=":projectId" element={<EasyProjectDetailPage />} />
              <Route path=":projectId/timeline" element={<EasyProjectsTimelinePage />} />
            </Route>
            <Route path="easyworkout" element={<EasyWorkoutLayout />}>
              <Route index element={<Navigate to="/app/easyworkout/dashboard" replace />} />
              <Route path="dashboard" element={<EasyWorkoutDashboardPage />} />
              <Route path="routines" element={<EasyWorkoutRoutinesPage />} />
              <Route path="log" element={<EasyWorkoutLogPage />} />
            </Route>
            <Route path="easystatistics" element={<EasyStatisticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
