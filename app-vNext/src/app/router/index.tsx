import { Navigate, Route, Routes } from "react-router-dom";
import { AuthenticatedLayout } from "@/app/layouts/AuthenticatedLayout";
import { MarketingLayout } from "@/app/layouts/MarketingLayout";
import { AuthenticatedRoute } from "@/features/auth/AuthenticatedRoute";
import { EasyCalendarLayout } from "@/features/easycalendar/layouts/EasyCalendarLayout";
import { LoginPage } from "@/features/auth/routes/LoginPage";
import { EasyCalendarDayPage } from "@/features/easycalendar/routes/EasyCalendarDayPage";
import { EasyCalendarWeekPage } from "@/features/easycalendar/routes/EasyCalendarWeekPage";
import { EasyContactsLayout } from "@/features/easycontacts/layouts/EasyContactsLayout";
import { EasyContactsPage } from "@/features/easycontacts/routes/EasyContactsPage";
import { EasyListLayout } from "@/features/easylist/layouts/EasyListLayout";
import { EasyListArchivePage } from "@/features/easylist/routes/EasyListArchivePage";
import { EasyListDashboardPage } from "@/features/easylist/routes/EasyListDashboardPage";
import { EasyListInboxPage } from "@/features/easylist/routes/EasyListInboxPage";
import { EasyListTodayPage } from "@/features/easylist/routes/EasyListTodayPage";
import { EasyListUpcomingPage } from "@/features/easylist/routes/EasyListUpcomingPage";
import { EasyNotesLayout } from "@/features/easynotes/layouts/EasyNotesLayout";
import { EasyNotesEditorPage } from "@/features/easynotes/routes/EasyNotesEditorPage";
import { EasyNotesLibraryPage } from "@/features/easynotes/routes/EasyNotesLibraryPage";
import { EasyPipelineLayout } from "@/features/easypipeline/layouts/EasyPipelineLayout";
import { EasyPipelineDashboardPage } from "@/features/easypipeline/routes/EasyPipelineDashboardPage";
import { EasyPipelineEmailPage } from "@/features/easypipeline/routes/EasyPipelineEmailPage";
import { EasyPipelineStatsPage } from "@/features/easypipeline/routes/EasyPipelineStatsPage";
import { HQPage } from "@/features/hq/routes/HQPage";
import { EasyCalendarMarketingPage } from "@/features/marketing/routes/EasyCalendarMarketingPage";
import { EasyListMarketingPage } from "@/features/marketing/routes/EasyListMarketingPage";
import { EasyNotesMarketingPage } from "@/features/marketing/routes/EasyNotesMarketingPage";
import { EasyPipelineMarketingPage } from "@/features/marketing/routes/EasyPipelineMarketingPage";
import { MarketingLandingPage } from "@/features/marketing/routes/MarketingLandingPage";
import { SettingsPage } from "@/features/settings/routes/SettingsPage";

export function AppRouter() {
  return (
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
            <Route path="inbox" element={<EasyListInboxPage />} />
            <Route path="today" element={<EasyListTodayPage />} />
            <Route path="upcoming" element={<EasyListUpcomingPage />} />
            <Route path="archive" element={<EasyListArchivePage />} />
          </Route>
          <Route path="easycalendar" element={<EasyCalendarLayout />}>
            <Route index element={<Navigate to="/app/easycalendar/week" replace />} />
            <Route path="week" element={<EasyCalendarWeekPage />} />
            <Route path="day" element={<EasyCalendarDayPage />} />
          </Route>
          <Route path="easynotes" element={<EasyNotesLayout />}>
            <Route index element={<EasyNotesLibraryPage />} />
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
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
