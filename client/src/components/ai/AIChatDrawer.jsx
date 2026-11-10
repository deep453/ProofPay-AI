import { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, ShieldAlert, ChevronRight, RotateCcw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMilestones } from '../../hooks/useMilestones';

export default function AIChatDrawer({ isOpen, onClose }) {
  const { role, user } = useAuth();
  const { milestones } = useMilestones();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState(() => [
    {
      id: 'init_1',
      sender: 'ai',
      text: `Hello ${user?.name || 'there'}! I am ProofPay Agent 2.0 AI Assistant. I can analyze GitHub commit evidence, inspect criterion findings, generate acceptance criteria, or explain PayPal payment verification states. How can I assist your ${role} workflow today?`,
      timestamp: '12:00 PM',
      suggestions: [
        'Explain inconclusive finding in REST API milestone',
        'Draft criteria for PayPal Webhook signature verification',
        'Why is invoice status not marked Paid immediately?',
        'Show evidence for Login Page implementation'
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: `usr_${crypto.randomUUID()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // AI intelligent response engine
    setTimeout(() => {
      let aiReply = '';
      let replySuggestions = [];

      const query = text.toLowerCase();

      if (query.includes('inconclusive') || query.includes('rest api')) {
        aiReply = `### AI Assessment: REST API Integration (ms_002_rest_api)\n\n**Criterion 3 (Strict Request/Response Logging Redaction)** was flagged as **Inconclusive** because:\n\n1. Commit \`5b21004\` introduced Pino serializers that sanitize standard \`Authorization\` and \`Bearer\` headers.\n2. However, custom headers such as \`X-Partner-Secret\` and query parameter tokens were not explicitly listed in the redaction blacklist.\n\n> **Human-in-the-Loop Safeguard:** ProofPay Agent 2.0 requires the client to explicitly acknowledge this uncertainty before approving the milestone for PayPal invoicing.`;
        replySuggestions = ['How to resolve this in code?', 'Can I request a revision?'];
      } else if (query.includes('draft criteria') || query.includes('generate criteria') || query.includes('webhook')) {
        aiReply = `### Proposed Acceptance Criteria: PayPal Webhook Signature Verifier\n\n1. **Cryptographic Header Verification (SHA256 with RSA):**\n   *Description:* Verify \`PAYPAL-TRANSMISSION-ID\`, \`PAYPAL-TRANSMISSION-TIME\`, and \`PAYPAL-CERT-URL\` headers using PayPal's public certificates.\n   *Expected Evidence:* Unit test with valid and tampered raw webhook payloads.\n\n2. **Replay & Timestamp Skew Protection:**\n   *Description:* Reject webhook events with timestamps older than 300 seconds or previously processed \`eventId\` records.\n   *Expected Evidence:* Redis/Mongoose idempotency check in webhook controller.`;
        replySuggestions = ['Create this milestone now', 'Add rate limiting criterion'];
      } else if (query.includes('why') && (query.includes('paid') || query.includes('invoice'))) {
        aiReply = `### Strict Fintech Payment Rule\n\nUnder ProofPay architecture:\n\n* **Invoice Sent != Paid**: When a PayPal invoice is dispatched, it remains in \`invoice_sent\` state.\n* **Independent Verification Required**: ProofPay marks a milestone as **Paid** only after receiving a verified PayPal webhook (\`INVOICING.INVOICE.PAID\`) AND performing an independent server-to-server \`GET /v2/invoicing/invoices/{id}\` check verifying that status is definitively \`PAID\`.\n* Browser redirects or link clicks are never treated as payment confirmation.`;
        replySuggestions = ['Check current invoice statuses', 'View audit trail logs'];
      } else if (query.includes('login page') || query.includes('ms_001')) {
        aiReply = `### Milestone Evidence Dossier: Login Page Implementation\n\n* **Status:** Paid ($150.00 USD)\n* **Findings:** 3/3 Supported (100% Verified)\n* **Key Commits:**\n  - \`8f192b1a\`: Zod form schema & ARIA accessibility alerts\n  - \`c44199e1\`: Mobile flex layout & viewport wrapping\n  - \`e2910fa0\`: Vitest unit test suite (91.4% line coverage)\n* **Settlement:** PayPal Invoice \`INV2-R87M-992K-LQ14-7721\` confirmed via verified webhook.`;
        replySuggestions = ['View Login Page in Milestones', 'Show payment receipt'];
      } else if (query.includes('database') || query.includes('latency') || query.includes('revision')) {
        aiReply = `### Revision Analysis: Database Optimization (ms_005_db_opt)\n\n* **Flagged Criterion:** Query Latency Benchmark Under 25ms.\n* **AI Finding:** **Not Supported**.\n* **Reason:** Synthetic load test benchmark measured **58ms average latency**, exceeding the 25ms service level agreement.\n* **Recommended Developer Fix:** Apply \`.lean()\` projection, add subdocument slicing, and ensure index \`{ clientId: 1, status: 1 }\` is properly utilized.`;
        replySuggestions = ['Explain how to re-run verification', 'Check other milestones'];
      } else {
        aiReply = `ProofPay AI evaluated your request against repository evidence and milestone state machine rules. Currently tracking **${milestones.length} milestones** with active automated verification pipelines.\n\nFeel free to ask me to analyze specific commits, draft acceptance criteria, or explain compliance rules!`;
        replySuggestions = [
          'Explain inconclusive findings',
          'Draft criteria for authentication module',
          'How does verification work?'
        ];
      }

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${crypto.randomUUID()}`,
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: replySuggestions
        }
      ]);
    }, 900);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'init_reset',
        sender: 'ai',
        text: `Chat session reset. What can I help you verify today?`,
        timestamp: '12:00 PM',
        suggestions: [
          'Explain inconclusive finding in REST API milestone',
          'Why is invoice status not marked Paid immediately?',
          'Draft criteria for PayPal Webhook verification'
        ]
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-250">
      {/* Header */}
      <div className="p-4 bg-[#172554] text-white flex items-center justify-between border-b border-blue-900/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">ProofPay AI Copilot</h3>
              <span className="text-2xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium border border-blue-400/20 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Agent 2.0
              </span>
            </div>
            <p className="text-2xs text-slate-300">Evidence inspection & verification intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-blue-900/50 rounded-lg transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-blue-900/50 rounded-lg transition-colors"
            aria-label="Close AI drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/80 flex items-center gap-2 text-2xs text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          AI findings provide evidence-based assessments. Human approval is always required before invoicing.
        </span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
              }`}
            >
              <div className="space-y-2 whitespace-pre-wrap">
                {msg.text}
              </div>

              <div
                className={`text-3xs mt-1 text-right ${
                  msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {/* Quick Suggestions */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                {msg.suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(sug)}
                    className="text-left text-2xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1 group"
                  >
                    <span>{sug}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>ProofPay AI is inspecting repository evidence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3.5 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask AI about code evidence, criteria, or payments..."
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
