

require("dotenv").config();

const mongoose = require("mongoose");
const Milestone = require("./models/Milestone");

const {
  collectGitHubEvidence
} = require("./services/evidenceCollector");

const {
  buildEvidenceReport
} = require("./services/evidenceReportService");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const milestone = await Milestone.findById(
      process.env.TEST_MILESTONE_ID
    );

    if (!milestone) {
      throw new Error("Test milestone not found");
    }

    const collectedEvidence = await collectGitHubEvidence(
      milestone.githubRepo
    );

    const report = buildEvidenceReport(
      milestone,
      collectedEvidence
    );

    console.log("\nRepository:", report.repository);
    console.log("Finding count:", report.findings.length);

    for (const finding of report.findings) {
      console.log("\nCriterion:", finding.criterionTitle);
      console.log("Result:", finding.result);
      console.log("Explanation:", finding.explanation);
      console.log("Potential evidence:", finding.evidence.length);
    }

    console.log("\nLimitations:");
    report.limitations.forEach(item => console.log("-", item));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(error => {
  console.error("Report test failed:", error.message);
  process.exitCode = 1;
});

