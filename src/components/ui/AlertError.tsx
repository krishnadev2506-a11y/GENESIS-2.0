'use client';

import { m, AnimatePresence } from 'framer-motion';

interface AlertErrorProps {
  error: string | null | undefined;
  title?: string;
}

export function AlertError({ error, title = 'Error' }: AlertErrorProps) {
  return (
    <AnimatePresence>
      {error && (
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4"
        >
          <div className="mt-0.5 text-danger">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-danger">{title}</h4>
            <p className="text-sm text-danger/80">{error}</p>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
