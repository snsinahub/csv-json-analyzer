'use client';

import { useEffect, useState } from 'react';

/**
 * Configuration Status Banner
 * Shows a warning if OAuth is not configured
 */
export default function ConfigBanner() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to check config status:', error);
        setLoading(false);
      });
  }, []);

  if (loading || !status) {
    return null;
  }

  if (status.configured) {
    return null; // OAuth is configured, no need to show banner
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            GitHub OAuth Not Configured
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Authentication is disabled. To enable GitHub login:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Run <code className="bg-yellow-100 px-1 rounded">npm run setup-oauth</code> in your terminal</li>
              <li>Or set environment variables on your deployment platform</li>
              <li>Or visit <a href="/setup" className="underline">Setup Page</a> to configure manually</li>
            </ol>
            {status.errors && status.errors.length > 0 && (
              <div className="mt-2 text-xs">
                <strong>Issues:</strong>
                <ul className="list-disc list-inside ml-2">
                  {status.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
