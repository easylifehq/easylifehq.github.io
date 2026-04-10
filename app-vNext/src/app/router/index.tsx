import { Navigate, Route, Routes } from "react-router-dom";
import { AuthenticatedLayout } from "@/app/layouts/AuthenticatedLayout";
import { AuthenticatedRoute } from "@/features/auth/AuthenticatedRoute";
import { LoginPage } from "@/features/auth/routes/LoginPage";
import { EasyCalendarDayPage } from "@/features/easycalendar/routes/EasyCalendarDayPage";
import { EasyCalendarWeekPage } from "@/features/easycalendar/routes/EasyCalendarWeekPage";
import { EasyListLayout } from "@/features/easylist/layouts/EasyListLayout";
import { EasyListArchivePage } from "@/features/easylist/routes/EasyListArchivePage";
import { EasyListInboxPage } from "@/features/easylist/routes/EasyListInboxPage";
import { EasyListTodayPage } from "@/features/easylist/routes/EasyListTodayPage";
import { EasyListUpcomingPage } from "@/features/easylist/routes/EasyListUpcomingPage";
import { HQPage } from "@/features/hq/routes/HQPage";
import { SettingsPage } from "@/features/settings/routes/SettingsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/hq" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AuthenticatedRoute />}>
        <Route path="/app" element={<AuthenticatedLayout />}>
          <Route index element={<Navigate to="/app/hq" replace />} />
          <Route path="hq" element={<HQPage />} />
          <Route path="easylist" element={<EasyListLayout />}>
            <Route index element={<Navigate to="/app/easylist/inbox" replace />} />
            <Route path="inbox" element={<EasyListInboxPage />} />
            <Route path="today" element={<EasyListTodayPage />} />
            <Route path="upcoming" element={<EasyListUpcomingPage />} />
            <Route path="archive" element={<EasyListArchivePage />} />
          </Route>
          <Route path="easycalendar">
            <Route index element={<Navigate to="/app/easycalendar/week" replace />} />
            <Route path="week" element={<EasyCalendarWeekPage />} />
            <Route path="day" element={<EasyCalendarDayPage />} />
          </Route>
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
