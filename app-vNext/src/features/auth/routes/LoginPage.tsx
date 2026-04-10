import { FormEvent, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "../AuthContext";

type Mode = "login" | "signup";

export function LoginPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(
    () => (mode === "login" ? "Log in to Easy System" : "Create your Easy account"),
    [mode]
  );

  if (user) {
    return <Navigate to="/app/hq" replace />;
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
        <p className="eyebrow">Easy System</p>
        <h1>{title}</h1>
        <p className="auth-copy">
          Shared login for EasyHQ, EasyList, and EasyCalendar.
        </p>

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
