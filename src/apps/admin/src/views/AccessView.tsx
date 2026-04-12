import React, { FormEvent, useState } from "react";
import { ArrowRight, Lock, ShieldAlert, UserRoundCheck } from "lucide-react";
import { RuntimeConfig } from "../../../../lib/runtime";

interface AccessViewProps {
  runtime: RuntimeConfig;
  sessionState: "loading" | "authenticated" | "unauthenticated" | "unknown" | "error";
  sessionMessage: string;
  actorEmail?: string;
  authSource?: string;
  onBootstrapLogin: (email: string, password: string) => Promise<void>;
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

export function AccessView({
  runtime,
  sessionState,
  sessionMessage,
  actorEmail,
  authSource,
  onBootstrapLogin,
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
            <ActionLink href={runtime.loginUrl} label="Login" />
            <ActionLink href={runtime.signupUrl} label="Signup" />
            <ActionLink href={runtime.demoRequestUrl} label="Request Demo" />
            <ActionLink href={runtime.operatorAccessUrl} label="Operator Access URL" />
          </div>
        </div>
      </div>
    </div>
  );
}
