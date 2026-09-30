import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <SearchX className="h-16 w-16 text-slate-300" aria-hidden="true" />
      <h1 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-slate-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}
