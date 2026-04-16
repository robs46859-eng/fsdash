import React, { FormEvent, useState } from "react";
import { ArrowRight, Lock, ShieldAlert, UserRoundCheck } from "lucide-react";
import { RuntimeConfig } from "../../../../lib/runtime";

type AuthPanel = "login" | "signup" | "reset";

interface AccessViewProps {
  runtime: RuntimeConfig;
  sessionState: "loading" | "authenticated" | "unauthenticated" | "unknown" | "error";
  sessionMessage: string;
  actorEmail?: string;
  authSource?: string;
  onBootstrapLogin: (email: string, password: string) => Promise<void>;
  onCustomerLogin?: (email: string, password: string) => Promise<void>;
  onCustomerSignup?: (email: string, password: string) => Promise<void>;
  onForgotPassword?: (email: string) => Promise<string | undefined>;
  onResetPassword?: (token: string, newPassword: string) => Promise<void>;
  onClearOperatorSession: () => Promise<void>;
  onOpenApp: () => void;
}

function ActionLink({
  href,
  label,
}: {
  href?: string;
  label: string;
}) {
  if (!href) {
    return (
      <div className="border border-dashed border-outline-variant/40 bg-surface-container-low px-4 py-4 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
        {label} not configured
      </div>
    );
  }

  return (
    <a
      className="flex items-center justify-between bg-surface-container-high px-4 py-4 text-xs font-bold uppercase tracking-[0.2em] text-on-surface outline outline-1 -outline-offset-1 outline-outline-variant/15 transition-colors duration-150 ease-[cubic-bezier(0,0,0.2,1)] hover:bg-surface-container-highest hover:outline-primary/30"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
      <ArrowRight size={14} />
    </a>
  );
}

function CustomerAuthPanel({
  onLogin,
  onSignup,
  onForgotPassword,
  onResetPassword,
}: {
  onLogin?: (email: string, password: string) => Promise<void>;
  onSignup?: (email: string, password: string) => Promise<void>;
  onForgotPassword?: (email: string) => Promise<string | undefined>;
  onResetPassword?: (token: string, newPassword: string) => Promise<void>;
}) {
  const [panel, setPanel] = useState<AuthPanel>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Reset flow
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [devToken, setDevToken] = useState<string | undefined>();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function switchPanel(next: AuthPanel) {
    setPanel(next);
    setMessage("");
    setPassword("");
    setConfirmPassword("");
    setDevToken(undefined);
  }

  async function handleLoginSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (panel === "signup" && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      if (panel === "login") {
        await onLogin?.(email, password);
      } else {
        await onSignup?.(email, password);
      }
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const token = await onForgotPassword?.(email);
      setDevToken(token);
      setMessage(
        token
          ? "Token generated (dev mode — shown below). In production this would be emailed."
          : "If that address is registered, a reset link has been sent.",
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      await onResetPassword?.(resetToken, newPassword);
      setMessage("Password updated. You can now sign in.");
      switchPanel("login");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (panel === "reset") {
    const step = devToken !== undefined ? "enter-token" : "request";
    return (
      <div className="bg-surface-container-low outline outline-1 -outline-offset-1 outline-outline-variant/15">
        <div className="flex items-center justify-between px-5 pt-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            Reset Password
          </span>
          <button
            type="button"
            onClick={() => switchPanel("login")}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface"
          >
            ← Back to Login
          </button>
        </div>

        {step === "request" ? (
          <form onSubmit={handleForgotRequest} className="space-y-4 p-5">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                Your Email
              </label>
              <input
                className="ds-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
            >
              {submitting ? "Sending…" : "Send Reset Token"}
              <ArrowRight size={14} />
            </button>
            {message && <p className="text-sm leading-6 text-on-surface-variant">{message}</p>}
            {devToken && (
              <div className="bg-surface-container-high px-4 py-3 outline outline-1 -outline-offset-1 outline-primary/30">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Dev — Reset Token
                </p>
                <p className="break-all font-mono text-xs text-on-surface">{devToken}</p>
                <button
                  type="button"
                  onClick={() => setDevToken("entered")}
                  className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary underline underline-offset-2"
                >
                  Enter this token →
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4 p-5">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                Reset Token
              </label>
              <input
                className="ds-input font-mono text-xs"
                type="text"
                value={resetToken || (devToken !== "entered" ? (devToken ?? "") : "")}
                onChange={(e) => setResetToken(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                New Password
              </label>
              <input
                className="ds-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                Confirm New Password
              </label>
              <input
                className="ds-input"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
            >
              {submitting ? "Updating…" : "Update Password"}
              <ArrowRight size={14} />
            </button>
            {message && <p className="text-sm leading-6 text-on-surface-variant">{message}</p>}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low outline outline-1 -outline-offset-1 outline-outline-variant/15">
      <div className="flex">
        {(["login", "signup"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => switchPanel(p)}
            className={`flex-1 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] transition-colors ${
              panel === p
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {p === "login" ? "Login" : "Sign Up"}
          </button>
        ))}
      </div>
      <form onSubmit={handleLoginSignup} className="space-y-4 p-5">
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            Email
          </label>
          <input
            className="ds-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            Password
          </label>
          <input
            className="ds-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={panel === "login" ? "current-password" : "new-password"}
            minLength={panel === "signup" ? 8 : undefined}
            required
          />
        </div>
        {panel === "signup" && (
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              Confirm Password
            </label>
            <input
              className="ds-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
        >
          {submitting
            ? panel === "login"
              ? "Signing In…"
              : "Creating Account…"
            : panel === "login"
              ? "Sign In"
              : "Create Account"}
          <ArrowRight size={14} />
        </button>
        {panel === "login" && (
          <button
            type="button"
            onClick={() => switchPanel("reset")}
            className="w-full text-center text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface"
          >
            Forgot password?
          </button>
        )}
        {message && <p className="text-sm leading-6 text-on-surface-variant">{message}</p>}
      </form>
    </div>
  );
}

export function AccessView({
  runtime,
  sessionState,
  sessionMessage,
  actorEmail,
  authSource,
  onBootstrapLogin,
  onCustomerLogin,
  onCustomerSignup,
  onForgotPassword,
  onResetPassword,
  onClearOperatorSession,
  onOpenApp,
}: AccessViewProps) {
  const [email, setEmail] = useState("operator@fullstack.arkhamprison.com");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const canOpenApp =
    sessionState === "authenticated" || runtime.authMode === "none" || runtime.trustUpstreamAuth;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormMessage("");
    try {
      await onBootstrapLogin(email, password);
      setPassword("");
      setFormMessage("Operator bearer session established.");
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="ds-glass mx-auto max-w-4xl p-8 outline outline-1 -outline-offset-1 outline-outline-variant/15 md:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-surface-container-high font-display text-sm font-bold text-on-surface outline outline-1 -outline-offset-1 outline-outline-variant/15">
            F
          </div>
          <div>
            <p className="font-display text-xl font-semibold uppercase tracking-tight text-on-surface">FullStack Access</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Session Gate</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel p-6 md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center bg-surface-container-low text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
                {sessionState === "authenticated" ? (
                  <UserRoundCheck size={22} strokeWidth={1.6} />
                ) : sessionState === "error" ? (
                  <ShieldAlert size={22} strokeWidth={1.6} />
                ) : (
                  <Lock size={22} strokeWidth={1.6} />
                )}
              </div>
              <span className="bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
                {runtime.authMode === "none" ? "Auth Disabled" : "External Auth"}
              </span>
            </div>

            <h1 className="font-display text-3xl font-semibold uppercase tracking-tight text-on-surface">
              Operator access routes through the FullStack deployment boundary.
            </h1>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">{sessionMessage}</p>
            {actorEmail && (
              <div className="mt-4 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant outline outline-1 -outline-offset-1 outline-outline-variant/15">
                Signed in as <span className="font-semibold text-on-surface">{actorEmail}</span>
                {authSource ? ` via ${authSource}` : ""}.
              </div>
            )}

            {!canOpenApp && runtime.authMode === "external" && (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                    Operator email
                  </label>
                  <input
                    className="ds-input"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                    Bootstrap password
                  </label>
                  <input className="ds-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
                </div>
                <p className="text-xs leading-6 text-on-surface-variant">
                  This path stores the bootstrap-issued bearer token in local browser storage for operator testing. It does
                  not depend on the current Hosting cookie boundary.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="btn-primary inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
                    disabled={submitting}
                    type="submit"
                  >
                    {submitting ? "Signing In" : "Sign In"}
                    <ArrowRight size={14} />
                  </button>
                </div>
                {formMessage && <p className="text-sm leading-6 text-on-surface-variant">{formMessage}</p>}
              </form>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {canOpenApp && (
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
                  onClick={onOpenApp}
                >
                  Enter Dashboard
                  <ArrowRight size={14} />
                </button>
              )}
              {canOpenApp && runtime.authMode === "external" && (
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
                  onClick={() => void onClearOperatorSession()}
                >
                  Clear Session
                </button>
              )}
              {runtime.deploymentDocsUrl && (
                <a
                  className="btn-secondary inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
                  href={runtime.deploymentDocsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Deployment Notes
                  <ArrowRight size={14} />
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            {runtime.authMode === "external" && !runtime.loginUrl && !runtime.signupUrl ? (
              <CustomerAuthPanel
                onLogin={onCustomerLogin}
                onSignup={onCustomerSignup}
                onForgotPassword={onForgotPassword}
                onResetPassword={onResetPassword}
              />
            ) : (
              <>
                <ActionLink href={runtime.loginUrl} label="Login" />
                <ActionLink href={runtime.signupUrl} label="Signup" />
              </>
            )}
            <ActionLink href={runtime.demoRequestUrl} label="Request Demo" />
            <ActionLink href={runtime.operatorAccessUrl} label="Operator Access URL" />
          </div>
        </div>
      </div>
    </div>
  );
}
