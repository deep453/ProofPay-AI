import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMilestones } from '../../hooks/useMilestones';
import AcceptanceCriteria from './AcceptanceCriteria';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { formatCurrency } from '../../utils/formatCurrency';
import { ShieldCheck, FolderGit2, DollarSign } from 'lucide-react';
import { USE_MOCK_DATA } from '../../services/api';
import { developerService } from '../../services/developerService';

export default function MilestoneForm({ initialValues }) {
  const { user, demoAccounts } = useAuth();
  const { createMilestone } = useMilestones();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    developerEmail: initialValues?.developerEmail ||
  (USE_MOCK_DATA ? demoAccounts.developers[0]?.email || '' : ''),
    githubRepo: initialValues?.githubRepo || 'fintechlabs/proofpay-core',
    amount: initialValues?.amount || 250,
    currency: initialValues?.currency || 'USD',
    acceptanceCriteria: initialValues?.acceptanceCriteria || [
      {
        title: 'Form Validation & Accessibility Checks',
        description: 'Implement client-side input validations with ARIA attributes and WCAG AA contrast compliance.'
      },
      {
        title: 'Automated Unit Test Coverage > 80%',
        description: 'Provide Vitest unit tests verifying nominal and error flows with all assertions passing.'
      }
    ]
  });
    const [developers, setDevelopers] = useState(
    USE_MOCK_DATA ? demoAccounts.developers : []
  );
  const [developersLoading, setDevelopersLoading] = useState(!USE_MOCK_DATA);
  const [developerLoadError, setDeveloperLoadError] = useState('');

  useEffect(() => {
    if (USE_MOCK_DATA) return;

    let isActive = true;

    const loadDevelopers = async () => {
      try {
        const result = await developerService.getDevelopers();

        if (!isActive) return;

        setDevelopers(result);

        setFormData((prev) => ({
          ...prev,
          developerEmail: result.some(
            (developer) => developer.email === prev.developerEmail
          )
            ? prev.developerEmail
            : result[0]?.email || ''
        }));
      } catch (error) {
        if (isActive) {
          setDeveloperLoadError(
            error.message || 'Could not load registered developers.'
          );
        }
      } finally {
        if (isActive) {
          setDevelopersLoading(false);
        }
      }
    };

    loadDevelopers();

    return () => {
      isActive = false;
    };
  }, []);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedDeveloper = developers.find(
    (developer) =>
      developer.email.toLowerCase() === formData.developerEmail.toLowerCase()
  ) || {
    name: 'Select a developer',
    email: formData.developerEmail
  };
  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.length > 150) {
      errs.title = 'Title must be under 150 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required';
    }

    if (!formData.githubRepo.trim() || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(formData.githubRepo.trim())) {
      errs.githubRepo = 'GitHub repository must be in owner/repo format (e.g. org/repo)';
    }

    if (!formData.amount || Number(formData.amount) < 0.01) {
      errs.amount = 'Amount must be at least $0.01';
    }

    if (!formData.acceptanceCriteria || formData.acceptanceCriteria.length === 0) {
      errs.acceptanceCriteria = 'At least one acceptance criterion is required';
    } else {
      const invalidCriterion = formData.acceptanceCriteria.some(
        (c) => !c.title.trim() || !c.description.trim()
      );
      if (invalidCriterion) {
        errs.acceptanceCriteria = 'All criteria must have both a title and description';
      }
    }
        if (
      !formData.developerEmail ||
      !developers.some((developer) => developer.email === formData.developerEmail)
    ) {
      errs.developerEmail = 'Please select a registered developer';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        developerName: selectedDeveloper.name,
        clientId: user?.id,
        clientName: user?.name,
        clientEmail: user?.email,
        status: 'draft'
      };

      const created = await createMilestone(payload);
      navigate(`/client/milestones/${created._id}`);
    } catch {
      // toast shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiSuggestCriteria = () => {
    setFormData((prev) => ({
      ...prev,
      acceptanceCriteria: [
        ...prev.acceptanceCriteria,
        {
          id: `ai_${Date.now()}`,
          title: 'Cryptographic Signature Verification',
          description: 'Validate transmission headers and CRC32 payload checksum against public cert pem.'
        },
        {
          id: `ai_${Date.now() + 1}`,
          title: 'Idempotent Replay Defense',
          description: 'Reject duplicate event IDs and timestamp drifts greater than 300 seconds.'
        }
      ]
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form (2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Section A: Basic Info */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                A
              </span>
              <span>Milestone Deliverable Overview</span>
            </h3>

            <Input
              label="Milestone Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Login Page Implementation or REST API Gateway"
              error={errors.title}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detail the scope of work, technical specifications, and key deliverables..."
                className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.description ? 'border-rose-400' : 'border-slate-200 hover:border-slate-300 focus:border-blue-600'
                }`}
                required
              />
              {errors.description && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>}
            </div>

            <Select
              label="Assigned Developer"
              value={formData.developerEmail}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  developerEmail: e.target.value
                })
              }
              options={developers.map((developer) => ({
                value: developer.email,
                label: `${developer.name} (${developer.email})`
              }))}
              placeholder={
                developersLoading
                  ? 'Loading developers...'
                  : developers.length > 0
                    ? 'Select a developer'
                    : 'No registered developers found'
              }
              helperText={
                developerLoadError ||
                (USE_MOCK_DATA
                  ? 'Demo Mode: displaying sample developers.'
                  : 'Select a developer registered with ProofPay.')
              }
              error={errors.developerEmail}
              disabled={developersLoading || developers.length === 0}
              required
            />
          </div>

          {/* Section B: Repository */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                B
              </span>
              <span>Target GitHub Repository</span>
            </h3>

            <Input
              label="Repository Path (owner/repo)"
              value={formData.githubRepo}
              onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
              placeholder="e.g. fintechlabs/proofpay-core"
              icon={FolderGit2}
              helperText="ProofPay AI inspects commits and pull requests submitted to this repository."
              error={errors.githubRepo}
              required
            />
          </div>

          {/* Section C: Acceptance Criteria */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                C
              </span>
              <span>Acceptance Criteria Checklist</span>
            </h3>

            <AcceptanceCriteria
              criteria={formData.acceptanceCriteria}
              onChange={(updated) => setFormData({ ...formData, acceptanceCriteria: updated })}
              onAiSuggest={handleAiSuggestCriteria}
            />
            {errors.acceptanceCriteria && (
              <p className="text-xs text-rose-600 font-semibold">{errors.acceptanceCriteria}</p>
            )}
          </div>

          {/* Section D: Payment */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                D
              </span>
              <span>PayPal Milestone Compensation</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Payment Amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                icon={DollarSign}
                placeholder="250.00"
                error={errors.amount}
                required
              />

              <Select
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' }
                ]}
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/client/milestones')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={(e) => handleSubmit(e, true)}
              loading={isSubmitting}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={isSubmitting}
            >
              Create Milestone
            </Button>
          </div>
        </form>
      </div>

      {/* Right Summary Panel (1 col) */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sticky top-24 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400">
              Live Summary
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">
              {formData.title || 'Untitled Milestone'}
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Total Compensation</span>
              <span className="font-extrabold text-blue-600 text-sm font-mono">
                {formatCurrency(formData.amount, formData.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Criteria Count</span>
              <span className="font-bold text-slate-800">
                {formData.acceptanceCriteria.length} item(s)
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Repository</span>
              <span className="font-mono text-3xs text-slate-700 truncate max-w-[150px]">
                {formData.githubRepo || '—'}
              </span>
            </div>

            <div className="py-2">
              <span className="text-slate-500 block mb-1">Developer</span>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {selectedDeveloper.name?.charAt(0) || 'D'}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate text-xs">{selectedDeveloper.name}</div>
                  <div className="text-3xs text-slate-400 truncate">{selectedDeveloper.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Verification Safeguard Box */}
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 text-2xs text-blue-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Verifiable Settlement Guarantee</span>
            </div>
            <p className="leading-relaxed">
              Upon developer submission, ProofPay AI evaluates commit diffs against each acceptance criterion. You retain final sign-off authority prior to PayPal invoice dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
