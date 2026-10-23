'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from './actions';

interface LoginFormProps {
  redirectUrl?: string;
}

const initialState: LoginState = {};

export default function LoginForm({ redirectUrl }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm p-8 sm:p-10">
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-text-primary">
          Sign In
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enter your admin credentials to access the management portal.
        </p>
      </div>

      {state?.error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-start gap-3"
        >
          <svg
            className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="leading-snug">{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {redirectUrl && (
          <input type="hidden" name="redirect" value={redirectUrl} />
        )}

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            autoFocus
            disabled={isPending}
            placeholder="admin"
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text-primary text-sm shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-surface-alt disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            disabled={isPending}
            placeholder="••••••••••••"
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text-primary text-sm shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-surface-alt disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
