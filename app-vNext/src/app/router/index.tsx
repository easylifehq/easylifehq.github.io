import { lazy, Suspense, type ComponentType } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthenticatedLayout } from "@/app/layouts/AuthenticatedLayout";
import { MarketingLayout } from "@/app/layouts/MarketingLayout";
import { LoadingState } from "@/components/feedback/LoadingState";
import { AuthenticatedRoute } from "@/features/auth/AuthenticatedRoute";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettings } from "@/features/settings/SettingsContext";
import { getLastAppRoute } from "@/lib/mobile/appRouteMemory";

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
const EasyListEmailPage = lazyNamed(
  () => import("@/features/easylist/routes/EasyListEmailPage"),
  "EasyListEmailPage"
);
const EasyListDeletedPage = lazyNamed(
  () => import("@/features/easylist/routes/EasyListDeletedPage"),
  "EasyListDeletedPage"
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
const WorkoutExerciseInsightPage = lazyNamed(
  () => import("@/features/easyworkout/routes/WorkoutExerciseInsightPage"),
  "WorkoutExerciseInsightPage"
);
const WorkoutSessionReviewPage = lazyNamed(
  () => import("@/features/easyworkout/routes/WorkoutSessionReviewPage"),
  "WorkoutSessionReviewPage"
);
const EasyStatisticsPage = lazyNamed(
  () => import("@/features/easystatistics/routes/EasyStatisticsPage"),
  "EasyStatisticsPage"
);
const HQPage = lazyNamed(() => import("@/features/hq/routes/HQPage"), "HQPage");
const CommandCenterPage = lazyNamed(
  () => import("@/features/hq/routes/CommandCenterPage"),
  "CommandCenterPage"
);
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
const EasyHQMarketingPage = lazyNamed(
  () => import("@/features/marketing/routes/EasyHQMarketingPage"),
  "EasyHQMarketingPage"
);
const EasyProjectsMarketingPage = lazyNamed(
  () => import("@/features/marketing/routes/EasyProjectsMarketingPage"),
  "EasyProjectsMarketingPage"
);
const EasyContactsMarketingPage = lazyNamed(
  () => import("@/features/marketing/routes/EasyContactsMarketingPage"),
  "EasyContactsMarketingPage"
);
const EasyWorkoutMarketingPage = lazyNamed(
  () => import("@/features/marketing/routes/EasyWorkoutMarketingPage"),
  "EasyWorkoutMarketingPage"
);
const EasyStatisticsMarketingPage = lazyNamed(
  () => import("@/features/marketing/routes/EasyStatisticsMarketingPage"),
  "EasyStatisticsMarketingPage"
);
const MarketingLandingPage = lazyNamed(
  () => import("@/features/marketing/routes/MarketingLandingPage"),
  "MarketingLandingPage"
);
const SettingsPage = lazyNamed(
  () => import("@/features/settings/routes/SettingsPage"),
  "SettingsPage"
);

function StartupRedirect() {
  const { settings, isLoading } = useSettings();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState label="Opening your workspace..." detail="Loading your startup preference before choosing the first screen." />;
  }

  const target =
    settings.startupRoute === "last-used"
      ? getLastAppRoute()?.path || "/app/hq"
      : settings.startupRoute;

  const [pathname, rememberedSearch = ""] = target.split("?");

  return (
    <Navigate
      to={{ pathname, search: location.search || (rememberedSearch ? `?${rememberedSearch}` : ""), hash: location.hash }}
      replace
    />
  );
}

function PublicHomeRoute() {
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { settings, isLoading: isSettingsLoading } = useSettings();

  if (isAuthLoading || (user && isSettingsLoading)) {
    return <LoadingState label="Opening EasyLife..." detail="Checking sign-in and startup preferences before opening the app." />;
  }

  if (user) {
    const target =
      settings.startupRoute === "last-used"
        ? getLastAppRoute()?.path || "/app/hq"
        : settings.startupRoute;

    const [pathname, rememberedSearch = ""] = target.split("?");
    return (
      <Navigate
        to={{ pathname, search: location.search || (rememberedSearch ? `?${rememberedSearch}` : ""), hash: location.hash }}
        replace
      />
    );
  }

  return <MarketingLandingPage />;
}

function SettingsPathRedirect() {
  const location = useLocation();

  return (
    <Navigate
      to={{ pathname: "/app/settings", search: location.search, hash: location.hash }}
      replace
    />
  );
}

function PreserveSearchRedirect({ to }: { to: string }) {
  const location = useLocation();

  return (
    <Navigate
      to={{ pathname: to, search: location.search, hash: location.hash }}
      replace
    />
  );
}

function SafeAppNotFoundPage() {
  const location = useLocation();

  return (
    <main className="page-wrap app-theme">
      <section className="panel-section">
        <p className="eyebrow">Route safety</p>
        <h1>This page is not part of the demo path.</h1>
        <p>
          EasyLife could not find <strong>{location.pathname}</strong>. Nothing was changed or
          saved.
        </p>
        <div className="hero-actions">
          <Link className="button-primary" to={{ pathname: "/app/hq", search: location.search }}>
            Return to Today
          </Link>
          <Link className="button-secondary" to={{ pathname: "/app/easylist/add", search: location.search }}>
            Open Inbox
          </Link>
        </div>
      </section>
    </main>
  );
}

function PlanRouteLandingPage() {
  const location = useLocation();

  return (
    <main className="page-wrap app-theme app-theme-easycalendar">
      <section className="panel-section">
        <p className="eyebrow">Plan</p>
        <h1>Open today's Plan.</h1>
        <p>
          The reliable Plan surface is the day view. Nothing is scheduled automatically here;
          you choose what moves from Inbox into the day.
        </p>
        <div className="hero-actions">
          <Link className="button-primary" to={{ pathname: "/app/easycalendar/day", search: location.search }}>
            Open Plan day
          </Link>
          <Link className="button-secondary" to={{ pathname: "/app/hq", search: location.search }}>
            Return to Today
          </Link>
        </div>
      </section>
    </main>
  );
}

function WorkoutRouteLandingPage() {
  const location = useLocation();

  return (
    <main className="page-wrap app-theme app-theme-easyworkout">
      <section className="panel-section">
        <p className="eyebrow">Workout</p>
        <h1>Start from the Workout dashboard.</h1>
        <p>
          The dashboard is the safe entry point for logging, routines, and recent sessions.
          No workout AI or hidden changes run from this route.
        </p>
        <div className="hero-actions">
          <Link className="button-primary" to={{ pathname: "/app/easyworkout/dashboard", search: location.search }}>
            Open Workout dashboard
          </Link>
          <Link className="button-secondary" to={{ pathname: "/app/easyworkout/log", search: location.search }}>
            Open Log
          </Link>
          <Link className="ghost-button" to={{ pathname: "/app/hq", search: location.search }}>
            Return to Today
          </Link>
        </div>
      </section>
    </main>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingState label="Loading EasyLife..." detail="Preparing the next screen." />}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<PublicHomeRoute />} />
          <Route path="/easylist" element={<EasyListMarketingPage />} />
          <Route path="/easynotes" element={<EasyNotesMarketingPage />} />
          <Route path="/easycalendar" element={<EasyCalendarMarketingPage />} />
          <Route path="/easypipeline" element={<EasyPipelineMarketingPage />} />
          <Route path="/easyhq" element={<EasyHQMarketingPage />} />
          <Route path="/easyprojects" element={<EasyProjectsMarketingPage />} />
          <Route path="/easycontacts" element={<EasyContactsMarketingPage />} />
          <Route path="/easyworkout" element={<EasyWorkoutMarketingPage />} />
          <Route path="/easystatistics" element={<EasyStatisticsMarketingPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<AuthenticatedRoute />}>
          <Route path="/settings" element={<SettingsPathRedirect />} />
          <Route path="/app" element={<AuthenticatedLayout />}>
            <Route index element={<StartupRedirect />} />
            <Route path="hq" element={<HQPage />} />
            <Route path="today" element={<PreserveSearchRedirect to="/app/hq" />} />
            <Route path="inbox" element={<PreserveSearchRedirect to="/app/easylist/add" />} />
            <Route path="notes" element={<PreserveSearchRedirect to="/app/easynotes" />} />
            <Route path="plan" element={<PlanRouteLandingPage />} />
            <Route path="people" element={<PreserveSearchRedirect to="/app/easycontacts" />} />
            <Route path="workout" element={<WorkoutRouteLandingPage />} />
            <Route path="command" element={<CommandCenterPage />} />
            <Route path="easylist" element={<EasyListLayout />}>
              <Route index element={<PreserveSearchRedirect to="/app/easylist/dashboard" />} />
              <Route path="dashboard" element={<EasyListDashboardPage />} />
              <Route path="add" element={<EasyListInboxPage />} />
              <Route path="email" element={<EasyListEmailPage />} />
              <Route path="inbox" element={<PreserveSearchRedirect to="/app/easylist/add" />} />
              <Route path="today" element={<PreserveSearchRedirect to="/app/easylist/dashboard" />} />
              <Route path="upcoming" element={<PreserveSearchRedirect to="/app/easylist/dashboard" />} />
              <Route path="archive" element={<EasyListArchivePage />} />
              <Route path="deleted" element={<EasyListDeletedPage />} />
            </Route>
            <Route path="easycalendar" element={<EasyCalendarLayout />}>
              <Route index element={<PreserveSearchRedirect to="/app/easycalendar/month" />} />
              <Route path="week" element={<PreserveSearchRedirect to="/app/easycalendar/month" />} />
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
              <Route index element={<PreserveSearchRedirect to="/app/easypipeline/dashboard" />} />
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
              <Route index element={<PreserveSearchRedirect to="/app/easyworkout/dashboard" />} />
              <Route path="dashboard" element={<EasyWorkoutDashboardPage />} />
              <Route path="routines" element={<EasyWorkoutRoutinesPage />} />
              <Route path="log" element={<EasyWorkoutLogPage />} />
              <Route path="exercise/:exerciseId" element={<WorkoutExerciseInsightPage />} />
              <Route path="session/:sessionId" element={<WorkoutSessionReviewPage />} />
            </Route>
            <Route path="easystatistics" element={<EasyStatisticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<SafeAppNotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
