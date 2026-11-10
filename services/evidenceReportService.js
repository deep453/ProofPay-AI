

function getKeywords(criterion) {
  const text =
    `${criterion.title} ${criterion.description}`.toLowerCase();

  return [
    ...new Set(
      (text.match(/[a-z0-9]+/g) || [])
        .filter(word => word.length > 3)
    )
  ];
}

function findRelatedEvidence(criterion, collectedEvidence) {
  const keywords = getKeywords(criterion);

  const matchingCommits = (collectedEvidence.commits || [])
    .filter(commit => {
      const message = (commit.message || "").toLowerCase();
      return keywords.some(keyword => message.includes(keyword));
    })
    .map(commit => ({
      type: "commit",
      title: commit.message,
      url: commit.url,
      date: commit.date ? new Date(commit.date) : null,
      reference: commit.sha
    }));

  const matchingPullRequests = (collectedEvidence.pullRequests || [])
    .filter(pr => {
      const title = (pr.title || "").toLowerCase();
      return keywords.some(keyword => title.includes(keyword));
    })
    .map(pr => ({
      type: "pull_request",
      title: pr.title,
      url: pr.url,
      date: pr.mergedAt
        ? new Date(pr.mergedAt)
        : new Date(pr.createdAt),
      reference: String(pr.number)
    }));

  const matchingFiles = (collectedEvidence.files || [])
    .filter(file => {
      const path = (file.path || "").toLowerCase();
      const content = (file.content || "").toLowerCase();

      return keywords.some(keyword =>
        path.includes(keyword) || content.includes(keyword)
      );
    })
    .map(file => ({
      type: file.isTest ? "test_file" : "source_file",
      title: file.path,
      url: file.url,
      date: null,
      reference: file.sha
    }));

  return [
    ...matchingFiles,
    ...matchingCommits,
    ...matchingPullRequests
  ].slice(0, 10);
}

function buildEvidenceReport(milestone, collectedEvidence) {
  const findings = milestone.acceptanceCriteria.map(criterion => {
    const evidence = findRelatedEvidence(
      criterion,
      collectedEvidence
    );

    const sourceFiles = evidence.filter(
      item => item.type === "source_file"
    );

    const testFiles = evidence.filter(
      item => item.type === "test_file"
    );

    let explanation;

    if (sourceFiles.length > 0 && testFiles.length > 0) {
      explanation =
        "Potentially relevant source files and test files were found. Their presence provides inspection leads, but implementation correctness and successful test execution have not been established.";
    } else if (sourceFiles.length > 0) {
      explanation =
        "Potentially relevant source files were found. Their presence does not establish that the required behavior works, and no matching test file was identified.";
    } else if (testFiles.length > 0) {
      explanation =
        "Potentially relevant test files were found. Their presence does not establish that the tests pass or that the requirement is satisfied.";
    } else if (evidence.length > 0) {
      explanation =
        "Potentially related GitHub commits or pull requests were found, but their metadata does not prove that the requirement works.";
    } else {
      explanation =
        "No potentially relevant source files, test files, commits, or pull requests were identified in the collected evidence. This does not prove that the requirement failed.";
    }

    return {
      criterionId: criterion._id,
      criterionTitle: criterion.title,
      result: "inconclusive",
      explanation,
      evidence
    };
  });

  return {
    generatedAt: new Date(),
    repository: collectedEvidence.repository.name,
    findings,
    limitations: [
      "Keyword matching identifies potentially relevant files, not proof of implementation correctness.",
      "Source files have not been executed or independently validated.",
      "Test files have been identified but their tests have not been executed.",
      "Test coverage percentages have not been measured.",
      "Missing evidence does not establish that a requirement failed.",
      ...(collectedEvidence.limitations || [])
    ]
  };
}

module.exports = { buildEvidenceReport };
