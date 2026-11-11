require("dotenv").config();
const mongoose = require("mongoose");

const {
  collectGitHubEvidence
} = require("../services/evidenceCollector");

const {
  buildGeminiEvidenceReport
} = require("../services/geminiEvidenceService");

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

    console.log("Files collected:", collectedEvidence.files.length);
    console.log("Commits collected:", collectedEvidence.commits.length);
    console.log("Pull requests collected:", collectedEvidence.pullRequests.length);

    console.log("\nSending evidence to Gemini...");

    const report = await buildGeminiEvidenceReport(
      { acceptanceCriteria: criteria },
      collectedEvidence
    );

    console.log("\nGEMINI EVIDENCE REPORT:");
    console.log(JSON.stringify(report, null, 2));

    console.log("\nGEMINI TEST PASSED");
  } catch (error) {
  console.error("\nGEMINI TEST FAILED:", error.message);
  console.error("ERROR STACK:", error.stack);

  if (error.cause) {
    console.error("ERROR CAUSE:", error.cause);
  }

  process.exitCode = 1;
}
}

test();
