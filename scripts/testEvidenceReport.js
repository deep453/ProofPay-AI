require("dotenv").config();
const mongoose = require("mongoose");

const {
  collectGitHubEvidence
} = require("../services/evidenceCollector");

const {
  buildEvidenceReport
} = require("../services/evidenceReportService");

async function test() {
  try {
    const criteria = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Form Validation and Accessibility Checks",
        description:
          "The login form validates user inputs and provides accessible form controls."
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Automated Unit Test Coverage greater than 80%",
        description:
          "Automated unit tests cover more than 80 percent of the implementation."
      }
    ];

    console.log("Collecting GitHub evidence...");

    const collectedEvidence = await collectGitHubEvidence(
      "69AMM/authentication-dashboard",
      criteria
    );

    console.log("Generating evidence report...");

    const report = buildEvidenceReport(
      {
        acceptanceCriteria: criteria
      },
      collectedEvidence
    );

    console.log("\nEVIDENCE REPORT:");

    console.log(JSON.stringify(report, null, 2));

  } catch (error) {
    console.error("TEST FAILED:", error.message);
    process.exitCode = 1;
  }
}

test();

