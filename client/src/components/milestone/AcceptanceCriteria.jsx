import { Plus, Trash2, Sparkles } from 'lucide-react';
import Button from '../common/Button';

export default function AcceptanceCriteria({
  criteria = [],
  onChange,
  onAiSuggest,
  readOnly = false,
  className = ''
}) {
  const handleAddCriterion = () => {
    const updated = [
      ...criteria,
      {
        id: `temp_${Date.now()}`,
        title: '',
        description: '',
        expectedEvidence: ''
      }
    ];
    onChange(updated);
  };

  const handleRemoveCriterion = (index) => {
    if (criteria.length <= 1) return;
    const updated = criteria.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleFieldChange = (index, field, value) => {
    const updated = criteria.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    onChange(updated);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Acceptance Criteria <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500">
            Define verifiable criteria evaluated by AI against GitHub commits and PRs.
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            {onAiSuggest && (
              <Button
                variant="outline"
                size="sm"
                icon={Sparkles}
                onClick={onAiSuggest}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                AI Suggestions
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddCriterion}
            >
              Add Criterion
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3.5">
        {criteria.map((item, index) => (
          <div
            key={item._id || item.id || index}
            className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 relative group transition-all duration-150 hover:border-slate-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Criterion {index + 1}
                </span>
              </div>

              {!readOnly && criteria.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveCriterion(index)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  aria-label={`Remove criterion ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {readOnly ? (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-semibold text-slate-900">{item.title}</h4>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
                {item.expectedEvidence && (
                  <div className="text-3xs text-slate-500 font-mono bg-white p-2 rounded-lg border border-slate-200/70">
                    Expected Evidence: {item.expectedEvidence}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                    placeholder="e.g. Bcrypt Hash Salt Factor >= 12 or Responsive Layout < 480px"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                    placeholder="Describe specific expected behavior, files, endpoints, or error handling..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
