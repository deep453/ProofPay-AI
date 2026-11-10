export const MOCK_MILESTONES = [
  {
    _id: 'ms_001_login',
    title: 'Login Page Implementation',
    description: 'Implement secure responsive login interface with email/password validation, OAuth hooks, and WCAG AA accessibility compliance.',
    githubRepo: 'fintechlabs/proofpay-core',
    amount: 150,
    currency: 'USD',
    clientId: 'usr_c_01',
    clientName: 'Sarah Chen',
    clientEmail: 'sarah.chen@fintechlabs.io',
    developerId: 'usr_d_01',
    developerName: 'David Kim',
    developerEmail: 'david.kim@fullstack.dev',
    status: 'paid',
    paypalInvoiceId: 'INV2-R87M-992K-LQ14-7721',
    createdAt: '2026-10-14T09:00:00.000Z',
    updatedAt: '2026-10-22T14:30:00.000Z',
    acceptanceCriteria: [
      {
        _id: 'crit_101',
        title: 'Form Validation & Error States',
        description: 'Client-side email regex validation and password length checks (>8 chars) with accessible visual error states.'
      },
      {
        _id: 'crit_102',
        title: 'Responsive Design on Mobile Viewports',
        description: 'Login card wraps cleanly on screens < 480px without horizontal scrollbars or truncated inputs.'
      },
      {
        _id: 'crit_103',
        title: 'Unit Test Coverage > 85%',
        description: 'Automated Vitest/Jest unit tests covering successful auth, wrong passwords, and network failure fallbacks.'
      }
    ],
    evidenceReport: {
      generatedAt: '2026-10-18T16:20:00.000Z',
      repository: 'fintechlabs/proofpay-core',
      findings: [
        {
          criterionId: 'crit_101',
          criterionTitle: 'Form Validation & Error States',
          result: 'supported',
          explanation: 'Commit 8f192b1 added Zod schema validation and animated inline field warnings. Tested against valid and malformed credentials.',
          evidence: [
            {
              type: 'commit',
              title: 'feat: add Zod form schema and ARIA aria-invalid alerts',
              url: 'https://github.com/fintechlabs/proofpay-core/commit/8f192b1a',
              date: '2026-10-17T11:22:00.000Z',
              reference: '8f192b1'
            },
            {
              type: 'pull_request',
              title: 'PR #42: Login flow & validation hardening',
              url: 'https://github.com/fintechlabs/proofpay-core/pull/42',
              date: '2026-10-18T09:14:00.000Z',
              reference: '#42'
            }
          ]
        },
        {
          criterionId: 'crit_102',
          criterionTitle: 'Responsive Design on Mobile Viewports',
          result: 'supported',
          explanation: 'CSS media queries and Tailwind flex-col layout verified across 320px, 375px, and 414px device configurations.',
          evidence: [
            {
              type: 'commit',
              title: 'fix: mobile flex wrapping and safe area padding',
              url: 'https://github.com/fintechlabs/proofpay-core/commit/c44199e',
              date: '2026-10-17T15:05:00.000Z',
              reference: 'c44199e'
            }
          ]
        },
        {
          criterionId: 'crit_103',
          criterionTitle: 'Unit Test Coverage > 85%',
          result: 'supported',
          explanation: 'Jest coverage output confirmed 91.4% line coverage across Login.jsx and authService.js.',
          evidence: [
            {
              type: 'commit',
              title: 'test: add comprehensive auth form test suite with RTL',
              url: 'https://github.com/fintechlabs/proofpay-core/commit/e2910fa',
              date: '2026-10-18T12:00:00.000Z',
              reference: 'e2910fa'
            }
          ]
        }
      ],
      limitations: [
        'Browser visual layout verified via automated CSS assertions; manual high-DPI retina screen testing recommended.'
      ]
    }
  },
  {
    _id: 'ms_002_rest_api',
    title: 'REST API Integration',
    description: 'Integrate external payments REST gateway with exponential backoff retry mechanisms, token rotation, and idempotency key handling.',
    githubRepo: 'fintechlabs/proofpay-core',
    amount: 350,
    currency: 'USD',
    clientId: 'usr_c_01',
    clientName: 'Sarah Chen',
    clientEmail: 'sarah.chen@fintechlabs.io',
    developerId: 'usr_d_01',
    developerName: 'David Kim',
    developerEmail: 'david.kim@fullstack.dev',
    status: 'awaiting_client_approval',
    paypalInvoiceId: null,
    createdAt: '2026-10-24T10:15:00.000Z',
    updatedAt: '2026-11-04T18:00:00.000Z',
    acceptanceCriteria: [
      {
        _id: 'crit_201',
        title: 'Idempotency Key Middleware',
        description: 'Every POST mutation carries an UUID idempotency key cached in Redis to prevent duplicate debit charges.'
      },
      {
        _id: 'crit_202',
        title: 'Exponential Backoff on 429 & 503',
        description: 'Configurable retry loop with jitter: 3 attempts with 500ms, 1500ms, 3500ms intervals.'
      },
      {
        _id: 'crit_203',
        title: 'Strict Request/Response Logging Redaction',
        description: 'All PAN numbers, CVVs, and bearer tokens must be stripped before emitting Pino logs.'
      }
    ],
    evidenceReport: {
      generatedAt: '2026-11-04T17:45:00.000Z',
      repository: 'fintechlabs/proofpay-core',
      findings: [
        {
          criterionId: 'crit_201',
          criterionTitle: 'Idempotency Key Middleware',
          result: 'supported',
          explanation: 'Commit 7a3d11b introduces express-idempotency middleware storing request hashes with a 24-hour TTL.',
          evidence: [
            {
              type: 'commit',
              title: 'feat: add idempotency header verification and Redis lock',
              url: 'https://github.com/fintechlabs/proofpay-core/commit/7a3d11b',
              date: '2026-11-03T14:10:00.000Z',
              reference: '7a3d11b'
            },
            {
              type: 'pull_request',
              title: 'PR #58: Resilient payment client with circuit breaker',
              url: 'https://github.com/fintechlabs/proofpay-core/pull/58',
              date: '2026-11-04T11:20:00.000Z',
              reference: '#58'
            }
          ]
        },
        {
          criterionId: 'crit_202',
          criterionTitle: 'Exponential Backoff on 429 & 503',
          result: 'supported',
          explanation: 'Axios interceptor configured with retry-after header parsing and randomized exponential jitter.',
          evidence: [
            {
              type: 'commit',
              title: 'refactor: resilient http client retry handler with jitter',
              url: 'https://github.com/fintechlabs/proofpay-core/commit/9e8b220',
              date: '2026-11-03T16:45:00.000Z',
              reference: '9e8b220'
            }
          ]
        },
        {
          criterionId: 'crit_203',
          criterionTitle: 'Strict Request/Response Logging Redaction',
          result: 'inconclusive',
          explanation: 'Log sanitization function strips "authorization" and "token" keys, but custom nested header "X-Partner-Secret" was not explicitly found in redaction filter rules.',
          evidence: [
            {
              type: 'commit',
              title: 'chore: add pino serializers for sensitive fields',
              url: 'https://github.com/fintechlabs/proofpay-core/commit/5b21004',
              date: '2026-11-04T15:30:00.000Z',
              reference: '5b21004'
            }
          ]
        }
      ],
      limitations: [
        'AI evaluation detected potential secret exposure risk on custom non-standard headers. Client must review and acknowledge this inconclusive finding before proceeding.'
      ]
    }
  },
  {
    _id: 'ms_003_dashboard',
    title: 'Dashboard Redesign',
    description: 'Transform client overview with real-time financial telemetry, responsive SVG charts, and fast keyboard navigation.',
    githubRepo: 'fintechlabs/proofpay-core',
    amount: 500,
    currency: 'USD',
    clientId: 'usr_c_01',
    clientName: 'Sarah Chen',
    clientEmail: 'sarah.chen@fintechlabs.io',
    developerId: 'usr_d_02',
    developerName: 'Elena Rostova',
    developerEmail: 'elena.rostova@systems.io',
    status: 'verifying',
    paypalInvoiceId: null,
    createdAt: '2026-10-28T14:00:00.000Z',
    updatedAt: '2026-11-05T19:00:00.000Z',
    acceptanceCriteria: [
      {
        _id: 'crit_301',
        title: 'Executive Metric Cards',
        description: 'Provide quick stat cards for Total Balance, Income, Expenses with percentage variance trends.'
      },
      {
        _id: 'crit_302',
        title: 'Dynamic Interactive Spending Chart',
        description: 'Smooth SVG line chart rendering annual expenditure data with interactive hover tooltips.'
      },
      {
        _id: 'crit_303',
        title: 'Dark Navy Navigation & High-Contrast Typography',
        description: 'Implement dark navy sidebar with high-contrast accessibility compliance.'
      }
    ],
    evidenceReport: null
  },
  {
    _id: 'ms_004_auth_module',
    title: 'Authentication Module',
    description: 'JWT session tokens with HTTP-only cookies, password hashing with bcrypt (cost factor 12), and role-based route middleware.',
    githubRepo: 'cloudscale/identity-gateway',
    amount: 200,
    currency: 'USD',
    clientId: 'usr_c_02',
    clientName: 'Alex Mercer',
    clientEmail: 'alex.mercer@cloudscale.co',
    developerId: 'usr_d_01',
    developerName: 'David Kim',
    developerEmail: 'david.kim@fullstack.dev',
    status: 'invoice_sent',
    paypalInvoiceId: 'INV2-K99B-4241-TX88-9012',
    createdAt: '2026-10-19T08:00:00.000Z',
    updatedAt: '2026-11-03T11:20:00.000Z',
    acceptanceCriteria: [
      {
        _id: 'crit_401',
        title: 'Bcrypt Hash Salt Factor >= 12',
        description: 'Secure password storage with work factor 12 and rejection of passwords shorter than 12 characters.'
      },
      {
        _id: 'crit_402',
        title: 'Role-Based Authorization Middleware',
        description: 'Separate middleware guards ensuring developers cannot access client invoice authorization endpoints.'
      }
    ],
    evidenceReport: {
      generatedAt: '2026-11-02T14:15:00.000Z',
      repository: 'cloudscale/identity-gateway',
      findings: [
        {
          criterionId: 'crit_401',
          criterionTitle: 'Bcrypt Hash Salt Factor >= 12',
          result: 'supported',
          explanation: 'Verification of server/auth.js confirmed bcrypt.hash(password, 12) with length constraints.',
          evidence: [
            {
              type: 'commit',
              title: 'feat: configure bcrypt 12-round hashing with password length checks',
              url: 'https://github.com/cloudscale/identity-gateway/commit/33b91a0',
              date: '2026-11-01T10:14:00.000Z',
              reference: '33b91a0'
            }
          ]
        },
        {
          criterionId: 'crit_402',
          criterionTitle: 'Role-Based Authorization Middleware',
          result: 'supported',
          explanation: 'PR #19 introduces authenticate() and requireRole("client") checks on billing routes.',
          evidence: [
            {
              type: 'pull_request',
              title: 'PR #19: Add role-based middleware guards',
              url: 'https://github.com/cloudscale/identity-gateway/pull/19',
              date: '2026-11-02T09:30:00.000Z',
              reference: '#19'
            }
          ]
        }
      ],
      limitations: []
    }
  },
  {
    _id: 'ms_005_db_opt',
    title: 'Database Optimization',
    description: 'Optimize MongoDB query latency with compound indexes, lean projection queries, and cursor pagination.',
    githubRepo: 'cloudscale/identity-gateway',
    amount: 250,
    currency: 'USD',
    clientId: 'usr_c_02',
    clientName: 'Alex Mercer',
    clientEmail: 'alex.mercer@cloudscale.co',
    developerId: 'usr_d_02',
    developerName: 'Elena Rostova',
    developerEmail: 'elena.rostova@systems.io',
    status: 'needs_revision',
    paypalInvoiceId: null,
    createdAt: '2026-10-21T11:00:00.000Z',
    updatedAt: '2026-11-04T16:10:00.000Z',
    acceptanceCriteria: [
      {
        _id: 'crit_501',
        title: 'Compound Index on { clientId: 1, status: 1 }',
        description: 'Ensure IXSCAN execution strategy for milestone listings without in-memory sorting.'
      },
      {
        _id: 'crit_502',
        title: 'Query Latency Benchmark Under 25ms',
        description: 'Provide benchmark script demonstrating 10,000 synthetic records queried under 25ms.'
      }
    ],
    evidenceReport: {
      generatedAt: '2026-11-04T15:00:00.000Z',
      repository: 'cloudscale/identity-gateway',
      findings: [
        {
          criterionId: 'crit_501',
          criterionTitle: 'Compound Index on { clientId: 1, status: 1 }',
          result: 'supported',
          explanation: 'Index created in models/Milestone.js on { clientId: 1, status: 1 } and verified with getIndexes().',
          evidence: [
            {
              type: 'commit',
              title: 'perf: add compound index for milestone queries',
              url: 'https://github.com/cloudscale/identity-gateway/commit/b884210',
              date: '2026-11-03T18:20:00.000Z',
              reference: 'b884210'
            }
          ]
        },
        {
          criterionId: 'crit_502',
          criterionTitle: 'Query Latency Benchmark Under 25ms',
          result: 'not_supported',
          explanation: 'Benchmark script ran but recorded an average latency of 58ms under load. No caching or projection optimization was applied to subdocuments.',
          evidence: [
            {
              type: 'commit',
              title: 'test: add benchmark load test runner',
              url: 'https://github.com/cloudscale/identity-gateway/commit/aa1909f',
              date: '2026-11-04T14:15:00.000Z',
              reference: 'aa1909f'
            }
          ]
        }
      ],
      limitations: [
        'Criterion 502 failed benchmark targets. Revision requested by client to implement lean() projection and subdocument filtering.'
      ]
    }
  },
  {
    _id: 'ms_006_webhook_engine',
    title: 'PayPal Webhook Signature Verifier',
    description: 'Implement PayPal webhook cryptographic signature verification (CRC32 checksum and cert pem caching) according to PayPal developer standards.',
    githubRepo: 'fintechlabs/proofpay-core',
    amount: 450,
    currency: 'USD',
    clientId: 'usr_c_01',
    clientName: 'Sarah Chen',
    clientEmail: 'sarah.chen@fintechlabs.io',
    developerId: 'usr_d_01',
    developerName: 'David Kim',
    developerEmail: 'david.kim@fullstack.dev',
    status: 'draft',
    paypalInvoiceId: null,
    createdAt: '2026-11-05T10:00:00.000Z',
    updatedAt: '2026-11-05T10:00:00.000Z',
    acceptanceCriteria: [
      {
        _id: 'crit_601',
        title: 'Header Verification against PayPal Sandbox Cert',
        description: 'Validate transmissionId, timestamp, and signature header against PayPal auth algorithm.'
      },
      {
        _id: 'crit_602',
        title: 'Replay Attack Prevention',
        description: 'Reject webhooks timestamped older than 5 minutes or duplicate webhook event IDs.'
      }
    ],
    evidenceReport: null
  }
];
