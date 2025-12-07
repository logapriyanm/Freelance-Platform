import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <div className="max-w-xl w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-red-500 mb-6 shadow-sm">
          <span className="text-3xl font-bold">404</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 mb-6 text-sm sm:text-base">
          We couldn&apos;t find any page at
          <span className="mx-1 font-mono text-slate-700">
            {location.pathname}
          </span>
          . It may have been moved, deleted, or the URL is incorrect.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto"
          >
            Go to Home
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors duration-200 w-full sm:w-auto"
          >
            Browse Projects
          </Link>
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-wide text-slate-400">
          If you think this is a mistake, please contact support.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
