
const mongoose = require("mongoose");

const acceptanceCriterionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: true }
);

const evidenceItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
  "repository",
  "commit",
  "pull_request",
  "source_file",
  "test_file"
],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: null
    },
    reference: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

const criterionFindingSchema = new mongoose.Schema(
  {
    criterionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    criterionTitle: {
      type: String,
      required: true
    },
    result: {
      type: String,
      enum: ["supported", "not_supported", "inconclusive"],
      required: true
    },
    explanation: {
      type: String,
      required: true
    },
    evidence: {
      type: [evidenceItemSchema],
      default: []
    }
  },
  { _id: false }
);

const evidenceReportSchema = new mongoose.Schema(
  {
    generatedAt: {
      type: Date,
      required: true
    },
    repository: {
      type: String,
      required: true
    },
    findings: {
      type: [criterionFindingSchema],
      required: true
    },
    limitations: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    githubRepo: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "USD"
    },
    acceptanceCriteria: {
      type: [acceptanceCriterionSchema],
      validate: {
        validator: criteria => criteria.length > 0,
        message: "At least one acceptance criterion is required"
      }
    },
        clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: [
        "draft",
        "verifying",
        "evidence_ready",
        "awaiting_client_approval",
        "approved_for_invoice",
        "invoice_sent",
        "paid",
        "needs_revision",
        "blocked"
      ],
      default: "draft"
    },
    
evidenceReport: {
  type: evidenceReportSchema,
  default: null
},
    paypalInvoiceId: {
      type: String,
      default: null
    },
    paypalInvoiceUrl: {
      type: String,
      default: null
    },
    invoiceSentAt: {
      type: Date,
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Milestone", milestoneSchema);

