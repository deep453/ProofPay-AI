

const {
  getRepository,
  getCommits,
  getPullRequests,
  getRepositoryTree,
  getFileContent
} = require("./githubService");

const MAX_FILES = 20;
const MAX_FILE_SIZE = 100 * 1024;

const SOURCE_EXTENSIONS = [
  ".js", ".jsx", ".ts", ".tsx",
  ".py", ".java", ".cpp", ".c",
  ".h", ".hpp", ".go", ".rs",
  ".php", ".vue", ".html", ".css"
];

const TEST_PATTERNS = [
  /(^|\/)__tests__\//i,
  /\.(test|spec)\.[a-z0-9]+$/i,
  /(^|\/)tests?\//i
];

function isTestFile(path) {
  return TEST_PATTERNS.some(pattern => pattern.test(path));
}

function getCriterionKeywords(criteria) {
  const text = criteria
    .map(item => `${item.title} ${item.description}`)
    .join(" ")
    .toLowerCase();

  return [
    ...new Set(
      (text.match(/[a-z0-9]+/g) || [])
        .filter(word => word.length > 3)
    )
  ];
}

function selectRelevantFiles(files, criteria) {
  const keywords = getCriterionKeywords(criteria);

  const candidates = files
    .filter(file => {
      const path = file.path.toLowerCase();

      const supportedExtension = SOURCE_EXTENSIONS.some(
        extension => path.endsWith(extension)
      );

      const excludedPath =
        path.includes("node_modules/") ||
        path.includes("dist/") ||
        path.includes("build/") ||
        path.includes("coverage/") ||
        path.includes(".git/");

      return (
        supportedExtension &&
        !excludedPath &&
        typeof file.size === "number" &&
        file.size > 0 &&
        file.size <= MAX_FILE_SIZE
      );
    })
    .map(file => {
      const path = file.path.toLowerCase();
      const test = isTestFile(path);

      const keywordMatches = keywords.filter(keyword =>
        path.includes(keyword)
      ).length;

      return {
        ...file,
        isTest: test,
        relevanceScore: keywordMatches * 2 + (test ? 3 : 0)
      };
    });

  candidates.sort((a, b) =>
    b.relevanceScore - a.relevanceScore
  );

  return candidates.slice(0, MAX_FILES);
}

async function collectGitHubEvidence(githubRepo, criteria = []) {
  if (typeof githubRepo !== "string") {
    throw new Error("GitHub repository must be a string");
  }

  const parts = githubRepo.trim().split("/");

  if (
    parts.length !== 2 ||
    !parts[0] ||
    !parts[1]
  ) {
    throw new Error("Repository must use owner/repo format");
  }

  const [owner, repo] = parts;

  const [repository, commits, pullRequests] = await Promise.all([
    getRepository(owner, repo),
    getCommits(owner, repo),
    getPullRequests(owner, repo)
  ]);

  const tree = await getRepositoryTree(
    owner,
    repo,
    repository.defaultBranch
  );

  const selectedFiles = selectRelevantFiles(
    tree.files,
    criteria
  );

  const fileResults = await Promise.allSettled(
    selectedFiles.map(async file => {
      const content = await getFileContent(
        owner,
        repo,
        file.sha
      );

      const encodedBranch = encodeURIComponent(
        repository.defaultBranch
      );

      const encodedPath = file.path
        .split("/")
        .map(encodeURIComponent)
        .join("/");

      return {
        path: file.path,
        sha: file.sha,
        size: file.size,
        isTest: file.isTest,
        content,
        url: `https://github.com/${owner}/${repo}/blob/${encodedBranch}/${encodedPath}`
      };
    })
  );

  const files = fileResults
  .filter(result => result.status === "fulfilled")
  .map(result => result.value);

const failedFiles = fileResults
  .map((result, index) => ({
    result,
    path: selectedFiles[index].path
  }))
  .filter(item => item.result.status === "rejected")
  .map(item => ({
    path: item.path,
    error: item.result.reason?.message || "Unknown download error"
  }));

  const limitations = [];

  if (tree.truncated) {
    limitations.push(
      "GitHub truncated the repository file tree; some files may not have been discovered."
    );
  }

  if (files.length < selectedFiles.length) {
    limitations.push(
      "Some selected repository files could not be downloaded."
    );
  }

  if (selectedFiles.length === MAX_FILES) {
    limitations.push(
      "The file inspection limit was reached; additional relevant files may exist."
    );
  }
  if (failedFiles.length > 0) {
  limitations.push(
    `${failedFiles.length} selected files could not be downloaded.`
  );
}

 return {
  repository,
  commits,
  pullRequests,
  files,
  failedFiles,
  limitations,
  collectedAt: new Date()
};
}

module.exports = { collectGitHubEvidence };
