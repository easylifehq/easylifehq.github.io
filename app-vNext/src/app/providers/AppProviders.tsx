import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthContext";
import { SettingsProvider } from "@/features/settings/SettingsContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
