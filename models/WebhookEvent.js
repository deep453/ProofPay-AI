const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    eventType: {
      type: String,
      required: true
    },
    invoiceId: {
      type: String,
      default: null
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
      default: null
    },
    status: {
      type: String,
      enum: [
        "received",
        "processing",
        "processed",
        "ignored",
        "failed"
      ],
      default: "received"
    },
    error: {
      type: String,
      default: null
    },
    receivedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "WebhookEvent",
  webhookEventSchema
);