


const API_BASE = "https://api.github.com";
const fs = require("fs");
const path = require("path");
const os = require("os");
const tar = require("tar");

async function githubRequest(path) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  console.log("\nGitHub endpoint:", path);
  console.log(
    "GitHub authentication enabled:",
    Boolean(headers.Authorization)
  );

  const response = await fetch(`${API_BASE}${path}`, { headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));

    const error = new Error(
      `GitHub API ${response.status} for ${path}: ${
        errorBody.message || response.statusText
      }`
    );

    error.status = response.status;
    throw error;
  }

  return response.json();
}

function validateRepoName(owner, repo) {
  const validName = /^[A-Za-z0-9_.-]+$/;

  if (!validName.test(owner) || !validName.test(repo)) {
    throw new Error("Invalid GitHub owner or repository name");
  }
}

async function getRepository(owner, repo) {
  validateRepoName(owner, repo);

  const data = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  );

  return {
    name: data.full_name,
    description: data.description,
    url: data.html_url,
    defaultBranch: data.default_branch,
    isPrivate: data.private,
    archived: data.archived
  };
}

async function getCommits(owner, repo) {
  validateRepoName(owner, repo);

  const data = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=10`
  );

  return data.map(commit => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: commit.commit.author?.name ?? null,
    date: commit.commit.author?.date ?? null,
    url: commit.html_url
  }));
}

async function getPullRequests(owner, repo) {
  validateRepoName(owner, repo);

  const data = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=all&per_page=10`
  );

  return data.map(pr => ({
    number: pr.number,
    title: pr.title,
    state: pr.state,
    merged: pr.merged_at !== null,
    createdAt: pr.created_at,
    mergedAt: pr.merged_at,
    url: pr.html_url
  }));
}

async function getRepositoryTree(owner, repo, branch) {
  validateRepoName(owner, repo);

  const data = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`
  );

  return {
    truncated: data.truncated,
    files: (data.tree || [])
      .filter(item => item.type === "blob")
      .map(item => ({
        path: item.path,
        sha: item.sha,
        size: item.size,
        url: item.url
      }))
  };
}

async function getFileContent(owner, repo, sha) {
  validateRepoName(owner, repo);

  if (!/^[a-f0-9]{40}$/i.test(sha)) {
    throw new Error("Invalid GitHub blob SHA");
  }

  const data = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs/${sha}`
  );

  if (data.encoding !== "base64" || !data.content) {
    throw new Error("Unsupported GitHub file encoding");
  }

  return Buffer.from(data.content, "base64").toString("utf8");
}

module.exports = {
  getRepository,
  getCommits,
  getPullRequests,
  getRepositoryTree,
  getFileContent
};