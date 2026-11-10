import { GitCommit, GitPullRequest, FolderGit2, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatDate';

export default function EvidenceCard({ item, className = '' }) {
  const isCommit = item.type === 'commit';
  const isPR = item.type === 'pull_request';

  return (
    <div className={`flex items-start justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-colors ${className}`}>
      <div className="flex items-start gap-2.5 min-w-0">
        <div
          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
            isCommit
              ? 'bg-blue-50 text-blue-600'
              : isPR
              ? 'bg-purple-50 text-purple-600'
              : 'bg-slate-50 text-slate-600'
          }`}
        >
          {isCommit ? <GitCommit className="w-3.5 h-3.5" /> : isPR ? <GitPullRequest className="w-3.5 h-3.5" /> : <FolderGit2 className="w-3.5 h-3.5" />}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-slate-900 truncate">
              {item.title}
            </span>
            {item.reference && (
              <span className="text-3xs font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                {item.reference}
              </span>
            )}
          </div>
          {item.date && (
            <div className="text-3xs text-slate-400 mt-0.5">
              Authored {formatRelativeTime(item.date)}
            </div>
          )}
        </div>
      </div>

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
          title="Inspect artifact on GitHub"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
