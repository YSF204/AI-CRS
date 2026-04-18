import React from 'react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

export default function RouteError() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong';

  const description = isRouteErrorResponse(error)
    ? error.data?.message || 'This page failed to load.'
    : error?.message || 'Please try again.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)] p-8">
      <div className="brutal-card max-w-lg w-full p-6 bg-[var(--card-bg)]">
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold uppercase tracking-tight">{title}</h1>
        <p className="font-mono text-sm text-[var(--fg-muted)] mt-2">{description}</p>
        <div className="mt-6 flex gap-3">
          <Link to="/" className="brutal-btn px-4 py-2 font-bold" style={{ background: 'var(--yellow)', color: '#0a0a0a' }}>
            Go Home
          </Link>
          <button
            className="brutal-btn px-4 py-2 font-bold"
            style={{ background: 'var(--teal)', color: '#0a0a0a' }}
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
