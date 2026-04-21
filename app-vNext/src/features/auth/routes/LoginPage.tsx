import { FormEvent, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "../AuthContext";
import { useSettings } from "@/features/settings/SettingsContext";
import { getLastAppRoute } from "@/lib/mobile/appRouteMemory";

type Mode = "login" | "signup";

export function LoginPage() {
  const { user } = useAuth();
  const { settings, isLoading: isSettingsLoading } = useSettings();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(
    () => (mode === "login" ? "Log in to EasyLifeHQ" : "Create your EasyLifeHQ account"),
    [mode]
  );

  if (user) {
    const target =
      settings.startupRoute === "last-used"
        ? getLastAppRoute()?.path || "/app/hq"
        : settings.startupRoute;

    return <Navigate to={isSettingsLoading ? "/app/hq" : target} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not complete auth.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      setMessage("Enter your email first, then try reset.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send reset email.");
    }
  }

  return (
    <main className="auth-page-vnext auth-page-shell">
      <section className="auth-card-vnext">
        <div className="auth-intro-grid">
          <div>
            <p className="eyebrow">EasyLifeHQ</p>
            <h1>{title}</h1>
            <p className="auth-copy">
              Tasks, notes, time, follow-ups, workouts, and progress in one calm workspace.
            </p>
          </div>
          <div className="auth-proof-card">
            <span>Start with</span>
            <strong>List + Notes + Calendar</strong>
            <p>Add the rest when the day needs more structure.</p>
          </div>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={`toggle-button${mode === "login" ? " active" : ""}`}
            onClick={() => setMode("login")}
          >
            Log In
          </button>
          <button
            type="button"
            className={`toggle-button${mode === "signup" ? " active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form-vnext" onSubmit={handleSubmit}>
          <label className="field-stack">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field-stack">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {message ? <p className="auth-message">{message}</p> : null}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "login"
                ? "Logging in..."
                : "Creating account..."
              : mode === "login"
                ? "Log In"
                : "Create Account"}
          </button>
        </form>

        <button type="button" className="text-button" onClick={() => void handleReset()}>
          Forgot password?
        </button>
      </section>
    </main>
  );
}
