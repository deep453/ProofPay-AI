const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const authenticate = require("./middleware/authenticate");
const {
  getRepository,
  getCommits,
  getPullRequests
} = require("./services/githubService");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Milestone = require("./models/Milestone");
const WebhookEvent = require("./models/WebhookEvent");
const { getNextStatus } = require("./services/milestoneState");
const { collectGitHubEvidence } = require("./services/evidenceCollector");
const { buildEvidenceReport } = require("./services/evidenceReportService");
const {
  buildGeminiEvidenceReport
} = require("./services/geminiEvidenceService");
const {
  createInvoice,
  sendInvoice,
  getInvoiceDetails,
  getAccessToken,
  verifyWebhookSignature
} = require("./services/paypalService");

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));
function validateMilestoneInput(body) {
  const errors = [];

  if (typeof body.title !== "string" || !body.title.trim()) {
    errors.push("Title is required");
  } else if (body.title.trim().length > 150) {
    errors.push("Title must be at most 150 characters");
  }

  if (typeof body.description !== "string" || !body.description.trim()) {
    errors.push("Description is required");
  }

  if (
    typeof body.githubRepo !== "string" ||
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(body.githubRepo.trim())
  ) {
    errors.push("GitHub repository must use the owner/repo format");
  }

  const amount = body.amount;

  if (
    amount === undefined ||
    amount === null ||
    amount === "" ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) < 0.01
  ) {
    errors.push("Amount must be a valid number greater than or equal to 0.01");
  }

  const currency = body.currency ?? "USD";

  if (
    typeof currency !== "string" ||
    !/^[A-Za-z]{3}$/.test(currency)
  ) {
    errors.push("Currency must be a three-letter currency code");
  }

  if (
    !Array.isArray(body.acceptanceCriteria) ||
    body.acceptanceCriteria.length === 0
  ) {
    errors.push("At least one acceptance criterion is required");
  } else {
    body.acceptanceCriteria.forEach((criterion, index) => {
      if (
        !criterion ||
        typeof criterion.title !== "string" ||
        !criterion.title.trim() ||
        typeof criterion.description !== "string" ||
        !criterion.description.trim()
      ) {
        errors.push(
          `Acceptance criterion ${index + 1} requires a title and description`
        );
      }
    });
  }

  return errors;
}

app.post(
  "/api/webhooks/paypal",
  express.raw({ type: "application/json" }),
  async (req, res) => {
  let webhookEventRecord = null;

  try {
      if (!Buffer.isBuffer(req.body)) {
        return res.status(400).json({
          error: "Expected a raw JSON webhook body"
        });
      }

      let event;

      try {
        event = JSON.parse(req.body.toString("utf8"));
      } catch {
        return res.status(400).json({
          error: "Invalid webhook JSON"
        });
      }

      const verified = await verifyWebhookSignature(
        req.headers,
        event
      );

      if (!verified) {
        return res.status(401).json({
          error: "PayPal webhook signature verification failed"
        });
      }

      if (!event.id) {
  return res.status(400).json({
    error: "Missing PayPal event ID"
  });
}

const invoiceId =
  event.resource?.invoice?.id ||
  event.resource?.id ||
  null;

  if (
  event.event_type === "INVOICING.INVOICE.PAID" &&
  !invoiceId
) {
  return res.status(400).json({
    error: "Missing invoice ID in PayPal event"
  });
}

try {
  webhookEventRecord = await WebhookEvent.create({
    eventId: event.id,
    eventType: event.event_type,
    invoiceId,
    status: "processing"
  });
} catch (error) {
  if (error.code !== 11000) {
    throw error;
  }

  const existingEvent = await WebhookEvent.findOne({
    eventId: event.id
  });

  if (!existingEvent) {
    throw error;
  }

  if (
  ["processed", "ignored"].includes(existingEvent.status)
) {
  return res.status(200).json({
    received: true,
    duplicate: true,
    status: existingEvent.status
  });
}

if (existingEvent.status === "processing") {
  return res.status(503).json({
    received: true,
    duplicate: true,
    message: "Event is currently being processed. Retry later."
  });
}

  webhookEventRecord = await WebhookEvent.findOneAndUpdate(
    {
      _id: existingEvent._id,
      status: { $in: ["failed", "received"] }
    },
    {
      $set: {
        status: "processing",
        error: null,
        invoiceId
      }
    },
    {
      new: true
    }
  );

  if (!webhookEventRecord) {
    return res.status(200).json({
      received: true,
      duplicate: true
    });
  }
}

if (event.event_type !== "INVOICING.INVOICE.PAID") {
  await WebhookEvent.findByIdAndUpdate(
    webhookEventRecord._id,
    {
      $set: {
        status: "ignored",
        processedAt: new Date()
      }
    }
  );

  return res.status(200).json({
    received: true,
    ignored: true
  });
}

const updateWebhookEvent = async (status, extra = {}) => {
  await WebhookEvent.findByIdAndUpdate(
    webhookEventRecord._id,
    {
      $set: {
        status,
        ...extra
      }
    }
  );
};
      const accessToken = await getAccessToken();

      const paypalBaseUrl =
        process.env.PAYPAL_ENV === "live"
          ? "https://api-m.paypal.com"
          : "https://api-m.sandbox.paypal.com";

      const invoiceResponse = await fetch(
        `${paypalBaseUrl}/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      const invoice = await invoiceResponse.json();

      if (!invoiceResponse.ok) {
  console.error(
    "Unable to retrieve PayPal invoice:",
    invoiceResponse.status
  );
  await updateWebhookEvent("failed", {
    error: `PayPal invoice retrieval failed: ${invoiceResponse.status}`
  });
  return res.status(502).json({
    error: "Unable to verify current invoice status"
  });
}
      if (invoice.status !== "PAID") {
  await updateWebhookEvent("failed", {
    error: `PayPal invoice status is ${invoice.status}, not PAID`
  });

  return res.status(502).json({
    received: true,
    paid: false,
    message: "PayPal has not confirmed full payment. Retry required."
  });
}
      const milestone = await Milestone.findOne({
        paypalInvoiceId: invoiceId
      });

      if (!milestone) {
  console.error(
    "No milestone found for verified PayPal invoice:",
    invoiceId
  );

  await updateWebhookEvent("ignored", {
    processedAt: new Date()
  });

  return res.status(200).json({
    received: true,
    matched: false
  });
}

      if (milestone.status === "paid") {
  await updateWebhookEvent("processed", {
    milestoneId: milestone._id,
    processedAt: new Date()
  });

  return res.status(200).json({
    received: true,
    status: "paid",
    duplicate: true
  });
}
      if (milestone.status !== "invoice_sent") {
  console.error(
    "Unexpected milestone status for paid invoice:",
    milestone.status
  );

  await updateWebhookEvent("ignored", {
    milestoneId: milestone._id,
    error: `Unexpected milestone status: ${milestone.status}`,
    processedAt: new Date()
  });

  return res.status(200).json({
    received: true,
    updated: false
  });
}

const paidStatus = getNextStatus(
  "invoice_sent",
  "payment_confirmed"
);

const updatedMilestone = await Milestone.findOneAndUpdate(
  {
    _id: milestone._id,
    paypalInvoiceId: invoiceId,
    status: "invoice_sent"
  },
  {
    $set: {
      status: paidStatus,
      paidAt: new Date()
    }
  },
  {
    new: true,
    runValidators: true
  }
);

if (!updatedMilestone) {
  const latestMilestone = await Milestone.findById(milestone._id);

  if (latestMilestone?.status === "paid") {
    await updateWebhookEvent("processed", {
      milestoneId: milestone._id,
      processedAt: new Date()
    });

    return res.status(200).json({
      received: true,
      status: "paid",
      duplicate: true
    });
  }

  await updateWebhookEvent("ignored", {
    milestoneId: milestone._id,
    error: "Milestone status changed before payment confirmation",
    processedAt: new Date()
  });

  return res.status(200).json({
    received: true,
    updated: false,
    message: "Milestone status changed before payment confirmation"
  });
}
await updateWebhookEvent("processed", {
  milestoneId: updatedMilestone._id,
  processedAt: new Date(),
  error: null
}); 
return res.status(200).json({
  received: true,
  milestoneId: updatedMilestone._id,
  status: updatedMilestone.status
});
    } catch (error) {
  console.error("PayPal webhook processing failed:", error.message);

  if (webhookEventRecord) {
    try {
      await WebhookEvent.findByIdAndUpdate(
        webhookEventRecord._id,
        {
          $set: {
            status: "failed",
            error: error.message
          }
        }
      );
    } catch (auditError) {
      console.error(
        "Webhook audit update failed:",
        auditError.message
      );
    }
  }

  return res.status(500).json({
    error: "Webhook processing failed"
  });
}
  }
);

app.use(express.json());
app.post("/api/auth/register", async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: "Authentication is not configured"
      });
    }

    const { name, email, password, role } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        error: "Name must be between 2 and 100 characters"
      });
    }

    if (
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        error: "A valid email is required"
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 72
    ) {
      return res.status(400).json({
        error: "Password must be between 12 and 72 characters"
      });
    }

    if (!["client", "developer"].includes(role)) {
      return res.status(400).json({
        error: "Role must be client or developer"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role
    });

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "An account with this email already exists"
      });
    }

    console.error("Registration failed:", error.message);

    res.status(500).json({
      error: "Failed to register account"
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: "Authentication is not configured"
      });
    }

    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+passwordHash");

    if (
      !user ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        subject: user._id.toString(),
        expiresIn: "1h",
        algorithm: "HS256"
      }
    );

    res.json({
      message: "Login successful",
      token,
      expiresIn: 3600,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login failed:", error.message);

    res.status(500).json({
      error: "Failed to log in"
    });
  }
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        error: "Account no longer exists"
      });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch {
    res.status(500).json({
      error: "Failed to fetch account"
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/milestones", authenticate, async (req, res) => {
  try {
    const milestones = await Milestone.find({
      $or: [
        { clientId: req.user.id },
        { developerId: req.user.id }
      ]
    }).sort({ createdAt: -1 });

    res.json(milestones);
  } catch (error) {
    console.error("Failed to fetch milestones:", error.message);

    res.status(500).json({
      error: "Failed to fetch milestones"
    });
  }
});
app.get("/api/invoices", authenticate, async (req, res) => {
  try {
    const milestones = await Milestone.find({
      $or: [
        { clientId: req.user.id },
        { developerId: req.user.id }
      ],
      paypalInvoiceId: { $ne: null }
    })
      .populate("clientId", "name email")
      .populate("developerId", "name email")
      .sort({ updatedAt: -1 });

    const invoices = milestones.map((milestone) => {
      const paid = milestone.status === "paid";
      const sent = milestone.status === "invoice_sent";

      return {
        id: milestone._id.toString(),
        invoiceNumber: milestone.paypalInvoiceId,
        paypalInvoiceId: milestone.paypalInvoiceId,
        milestoneId: milestone._id.toString(),
        milestoneTitle: milestone.title,
        clientId: milestone.clientId?._id?.toString() || null,
        clientName: milestone.clientId?.name || "Unavailable",
        clientEmail: milestone.clientId?.email || "",
        developerId: milestone.developerId?._id?.toString() || null,
        developerName: milestone.developerId?.name || "Unavailable",
        developerEmail: milestone.developerId?.email || "",
        amount: milestone.amount,
        currency: milestone.currency,
        status: paid ? "PAID" : sent ? "SENT" : "DRAFT",
        paymentStatus: paid ? "CONFIRMED" : "PENDING",
        invoiceDate: milestone.invoiceSentAt || null,
        paidDate: milestone.paidAt || null,
        paypalViewUrl: milestone.paypalInvoiceUrl || null
      };
    });

    res.json(invoices);
  } catch (error) {
    console.error("Failed to fetch invoices:", error.message);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});
app.get("/api/audit", authenticate, async (req, res) => {
  try {
    const milestones = await Milestone.find({
      $or: [
        { clientId: req.user.id },
        { developerId: req.user.id }
      ]
    })
      .select("_id title paypalInvoiceId")
      .lean();

    const milestoneIds = milestones.map(m => m._id);
    const invoiceIds = milestones
      .map(m => m.paypalInvoiceId)
      .filter(Boolean);

    if (milestoneIds.length === 0) {
      return res.json([]);
    }

    const events = await WebhookEvent.find({
      $or: [
        { milestoneId: { $in: milestoneIds } },
        { invoiceId: { $in: invoiceIds } }
      ]
    })
      .sort({ receivedAt: -1 })
      .lean();

    const milestoneById = new Map(
      milestones.map(m => [m._id.toString(), m])
    );

    const milestoneByInvoice = new Map(
      milestones
        .filter(m => m.paypalInvoiceId)
        .map(m => [m.paypalInvoiceId, m])
    );

    const auditEvents = events.map(event => {
      const milestone =
        (event.milestoneId
          ? milestoneById.get(event.milestoneId.toString())
          : null) ||
        (event.invoiceId
          ? milestoneByInvoice.get(event.invoiceId)
          : null);

      const status =
        event.status === "processed"
          ? "success"
          : event.status === "failed"
            ? "warning"
            : "info";

      const title = (event.eventType || "PayPal Webhook")
        .replaceAll(".", " ")
        .replaceAll("_", " ");

      return {
        id: event._id.toString(),
        eventId: event.eventId,
        eventType: event.eventType,
        category: "webhook",
        title,
        description: [
          `PayPal webhook status: ${event.status}.`,
          event.invoiceId ? `Invoice: ${event.invoiceId}.` : null,
          event.error ? `Details: ${event.error}` : null
        ].filter(Boolean).join(" "),
        actor: "PayPal",
        actorRole: "Webhook",
        referenceId: event.eventId,
        paypalInvoiceId: event.invoiceId || null,
        milestoneId: milestone?._id.toString() || null,
        milestoneTitle: milestone?.title || null,
        status,
        processingStatus: event.status,
        error: event.error || null,
        timestamp: event.processedAt || event.receivedAt,
        receivedAt: event.receivedAt,
        processedAt: event.processedAt || null
      };
    });

    return res.json(auditEvents);
  } catch (error) {
    console.error("Failed to fetch audit events:", error.message);
    return res.status(500).json({
      error: "Failed to fetch audit events"
    });
  }
});
app.get("/api/payments", authenticate, async (req, res) => {
  try {
    const milestones = await Milestone.find({
      $or: [
        { clientId: req.user.id },
        { developerId: req.user.id }
      ],
      status: { $in: ["invoice_sent", "paid"] },
      paypalInvoiceId: { $ne: null }
    })
      .populate("clientId", "name email")
      .populate("developerId", "name email")
      .sort({ paidAt: -1, invoiceSentAt: -1 });

    const invoiceIds = milestones.map(m => m.paypalInvoiceId);

    const webhookEvents = invoiceIds.length
      ? await WebhookEvent.find({
          invoiceId: { $in: invoiceIds },
          status: "processed"
        }).sort({ receivedAt: -1 })
      : [];

    const eventByInvoice = new Map();

    for (const event of webhookEvents) {
      if (!eventByInvoice.has(event.invoiceId)) {
        eventByInvoice.set(event.invoiceId, event);
      }
    }

    const payments = milestones.map(milestone => {
      const confirmed = milestone.status === "paid";
      const webhookEvent = eventByInvoice.get(milestone.paypalInvoiceId);

      return {
        id: milestone._id.toString(),
        paymentReference: milestone.paypalInvoiceId,
        milestoneId: milestone._id.toString(),
        milestoneTitle: milestone.title,
        paypalInvoiceId: milestone.paypalInvoiceId,
        amount: milestone.amount,
        currency: milestone.currency,
        status: confirmed ? "CONFIRMED" : "PENDING",
        confirmedAt: milestone.paidAt || webhookEvent?.processedAt || null,
        clientName: milestone.clientId?.name || "Unavailable",
        developerName: milestone.developerId?.name || "Unavailable",
        verificationMethod: confirmed
          ? "Verified webhook + PayPal invoice status check"
          : "Awaiting verified PayPal payment confirmation",
        webhookEventId: webhookEvent?.eventId || null
      };
    });

    return res.json(payments);
  } catch (error) {
    console.error("Failed to fetch payments:", error.message);
    return res.status(500).json({
      error: "Failed to fetch payment records"
    });
  }
});
app.post("/api/milestones", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        error: "Only clients can create milestones"
      });
    }

    const errors = validateMilestoneInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Invalid milestone data",
        details: errors
      });
    }

    if (
      typeof req.body.developerEmail !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        req.body.developerEmail.trim()
      )
    ) {
      return res.status(400).json({
        error: "A valid developerEmail is required"
      });
    }

    const developer = await User.findOne({
      email: req.body.developerEmail.trim().toLowerCase(),
      role: "developer"
    });

    if (!developer) {
      return res.status(404).json({
        error: "Registered developer not found"
      });
    }
    
    const milestone = await Milestone.create({
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      githubRepo: req.body.githubRepo.trim(),
      amount: Number(req.body.amount),
      currency: (req.body.currency || "USD").toUpperCase(),
      acceptanceCriteria: req.body.acceptanceCriteria.map(criterion => ({
        title: criterion.title.trim(),
        description: criterion.description.trim()
      })),
      clientId: req.user.id,
      developerId: developer._id
    });

    res.status(201).json(milestone);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "A conflicting record already exists"
      });
    }

    console.error("Milestone creation failed:", error.message);

    res.status(500).json({
      error: "Failed to create milestone"
    });
  }
});

app.get("/api/users/developers", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        error: "Only clients can view registered developers"
      });
    }

    const developers = await User.find({
      role: "developer"
    })
      .select("_id name email")
      .sort({ name: 1 });

    res.status(200).json(developers);
  } catch (error) {
    console.error("Fetching developers failed:", error.message);

    res.status(500).json({
      error: "Failed to fetch developers"
    });
  }
});


// app.patch("/api/milestones/:id/action", async (req, res) => {
//   try {
//     const milestone = await Milestone.findById(req.params.id);

//     if (!milestone) {
//       return res.status(404).json({
//         error: "Milestone not found"
//       });
//     }

//     const nextStatus = getNextStatus(
//       milestone.status,
//       req.body.action
//     );

//     milestone.status = nextStatus;
//     await milestone.save();

//     res.json(milestone);
//   } catch (error) {
//     const invalidTransition = error.message.startsWith(
//       "Invalid transition:"
//     );

//     res.status(invalidTransition ? 409 : 400).json({
//       error: error.message
//     });
//   }
// });

app.post("/api/milestones/:id/verify", authenticate, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid milestone ID" });
    }

    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    if (req.user.role !== "developer") {
      return res.status(403).json({
        error: "Only developers can trigger verification"
      });
    }

    if (milestone.developerId.toString() !== req.user.id) {
      return res.status(403).json({
        error: "You are not assigned to this milestone"
      });
    }

    if (milestone.status !== "verifying") {
      return res.status(409).json({
        error: "Milestone must be in verifying status"
      });
    }

   const collectedEvidence = await collectGitHubEvidence(
  milestone.githubRepo,
  milestone.acceptanceCriteria
);

    const report = await buildGeminiEvidenceReport(
  milestone,
  collectedEvidence
);

    milestone.evidenceReport = report;
    milestone.status = getNextStatus(
      milestone.status,
      "evidence_ready"
    );

    await milestone.save();

    return res.status(200).json({
      message: "Evidence report generated",
      milestoneId: milestone._id,
      status: milestone.status,
      evidenceReport: milestone.evidenceReport
    });
  } catch (error) {
    console.error("Milestone verification failed:", error.message);

    return res.status(500).json({
      error: "Failed to generate evidence report"
    });
  }
});

app.patch("/api/milestones/:id/action", authenticate, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid milestone ID"
      });
    }

    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        error: "Milestone not found"
      });
    }

    const action = req.body.action;

    const developerActions = [
  "start_verification",
  "restart_verification",
  "request_client_approval"
];

    const clientActions = [
      "client_approve",
      "request_revision"
    ];

    if (
      !developerActions.includes(action) &&
      !clientActions.includes(action)
    ) {
      return res.status(403).json({
        error: "This action is reserved for the backend workflow"
      });
    }

    if (developerActions.includes(action)) {
      if (req.user.role !== "developer") {
        return res.status(403).json({
          error: "Only developers can perform this action"
        });
      }

      if (milestone.developerId.toString() !== req.user.id) {
        return res.status(403).json({
          error: "You are not assigned to this milestone"
        });
      }
    }

    if (clientActions.includes(action)) {
      if (req.user.role !== "client") {
        return res.status(403).json({
          error: "Only clients can perform this action"
        });
      }

      if (milestone.clientId.toString() !== req.user.id) {
        return res.status(403).json({
          error: "You do not own this milestone"
        });
      }
    }
    if (action === "request_client_approval") {
  if (!milestone.evidenceReport) {
    return res.status(409).json({
      error: "Generate an evidence report before requesting client approval"
    });
  }

  const criteria = milestone.acceptanceCriteria;
  const findings = milestone.evidenceReport.findings;

  const reportMatchesCriteria =
    findings.length === criteria.length &&
    criteria.every(criterion =>
      findings.some(
        finding =>
          finding.criterionId.toString() === criterion._id.toString()
      )
    );

  if (!reportMatchesCriteria) {
    return res.status(409).json({
      error: "Evidence report does not match the current acceptance criteria"
    });
  }
}

  if (action === "client_approve") {
  if (!milestone.evidenceReport) {
    return res.status(409).json({
      error: "Cannot approve a milestone without an evidence report"
    });
  }

  const criteria = milestone.acceptanceCriteria;
  const findings = milestone.evidenceReport.findings;

  const reportMatchesCriteria =
    findings.length === criteria.length &&
    criteria.every(criterion =>
      findings.some(
        finding =>
          finding.criterionId.toString() === criterion._id.toString()
      )
    );

  if (!reportMatchesCriteria) {
    return res.status(409).json({
      error: "Evidence report does not match the current acceptance criteria"
    });
  }

  const hasInconclusiveFindings = findings.some(
    finding => finding.result === "inconclusive"
  );

  if (
    hasInconclusiveFindings &&
    req.body.acknowledgeInconclusive !== true
  ) {
    return res.status(409).json({
      error: "Some findings are inconclusive. Review the report and explicitly acknowledge this uncertainty before approval.",
      requiresInconclusiveAcknowledgement: true
    });
  }
}

    // AUTO_TRANSITION_EVIDENCE_READY_FOR_CLIENT_APPROVAL
    if (action === "client_approve" && milestone.status === "evidence_ready") {
      milestone.status = getNextStatus(
        milestone.status,
        "request_client_approval"
      );
    }
    const nextStatus = getNextStatus(
      milestone.status,
      action
    );

    milestone.status = nextStatus;
    await milestone.save();

    return res.json(milestone);
  } catch (error) {
    if (error.message.startsWith("Invalid transition:")) {
      return res.status(409).json({
        error: error.message
      });
    }

    console.error("Milestone action failed:", error.message);

    return res.status(500).json({
      error: "Failed to update milestone"
    });
  }
});

app.get("/api/milestones/:id/invoice", authenticate, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid milestone ID" });
    }

    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    const userId = req.user.id;
    const isClient =
      req.user.role === "client" &&
      milestone.clientId.toString() === userId;

    const isDeveloper =
      req.user.role === "developer" &&
      milestone.developerId.toString() === userId;

    if (!isClient && !isDeveloper) {
      return res.status(403).json({
        error: "You do not have access to this invoice"
      });
    }

    if (!milestone.paypalInvoiceId) {
      return res.status(404).json({
        error: "No PayPal invoice has been created for this milestone"
      });
    }

    const invoiceDetails = await getInvoiceDetails(
      milestone.paypalInvoiceId
    );

    if (invoiceDetails.invoiceUrl) {
      milestone.paypalInvoiceUrl = invoiceDetails.invoiceUrl;
      await milestone.save();
    }

    return res.json({
      milestoneId: milestone._id,
      invoiceId: invoiceDetails.id,
      invoiceUrl: invoiceDetails.invoiceUrl,
      paypalStatus: invoiceDetails.status,
      milestoneStatus: milestone.status
    });
  } catch (error) {
    console.error("Invoice details retrieval failed:", error.message);

    return res.status(502).json({
      error: "Unable to retrieve PayPal invoice details"
    });
  }
});
app.post("/api/milestones/:id/invoice", authenticate, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid milestone ID" });
    }

    if (req.user.role !== "client") {
      return res.status(403).json({
        error: "Only clients can request milestone invoices"
      });
    }

    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    if (milestone.clientId.toString() !== req.user.id) {
      return res.status(403).json({
        error: "You do not own this milestone"
      });
    }

    if (milestone.status !== "approved_for_invoice") {
      return res.status(409).json({
        error: "Only approved milestones can be invoiced",
        currentStatus: milestone.status
      });
    }

    const developer = await User.findById(milestone.developerId);

    if (!developer || !developer.email) {
      return res.status(409).json({
        error: "Assigned developer has no invoice recipient email"
      });
    }

    let invoiceId = milestone.paypalInvoiceId;

    if (!invoiceId) {
      const invoice = await createInvoice({
        recipientEmail: developer.email,
        title: milestone.title,
        description: milestone.description || milestone.title,
        amount: milestone.amount,
        currency: milestone.currency
      });

      invoiceId = invoice.id;
      milestone.paypalInvoiceId = invoiceId;

      // Save the invoice ID before sending, so a retry
      // can reuse this invoice if sending fails.
      await milestone.save();
    }

    await sendInvoice(invoiceId);

    const invoiceDetails = await getInvoiceDetails(invoiceId);
    milestone.paypalInvoiceUrl = invoiceDetails.invoiceUrl;

    milestone.invoiceSentAt = milestone.invoiceSentAt || new Date();

    milestone.status = getNextStatus(
      milestone.status,
      "invoice_sent"
    );

    await milestone.save();

    return res.json({
      message: "PayPal invoice sent successfully",
      milestoneId: milestone._id,
      invoiceId,
      invoiceUrl: milestone.paypalInvoiceUrl,
      status: milestone.status
    });
  } catch (error) {
    if (error.message.startsWith("Invalid transition:")) {
      return res.status(409).json({ error: error.message });
    }

    console.error("Milestone invoicing failed:", error.message);

    return res.status(502).json({
      error: "Unable to complete PayPal invoicing",
      invoiceId: undefined
    });
  }
});


app.get("/api/github/:owner/:repo", async (req, res) => {
  try {
    const repository = await getRepository(
      req.params.owner,
      req.params.repo
    );

    res.json(repository);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message
    });
  }
});

app.get("/api/github/:owner/:repo/commits", async (req, res) => {
  try {
    const commits = await getCommits(
      req.params.owner,
      req.params.repo
    );

    res.json(commits);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message
    });
  }
});

app.get("/api/github/:owner/:repo/pulls", async (req, res) => {
  try {
    const pullRequests = await getPullRequests(
      req.params.owner,
      req.params.repo
    );

    res.json(pullRequests);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message
    });
  }
});


async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("MongoDB connected");

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(error => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
