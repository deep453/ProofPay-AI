const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { Readable, Transform } = require("stream");
const { pipeline } = require("stream/promises");
const tar = require("tar");

const API_BASE = "https://api.github.com";

const MAX_ARCHIVE_SIZE = 50 * 1024 * 1024;
const MAX_EXTRACTED_SIZE = 200 * 1024 * 1024;
const MAX_FILES = 5000;

function validateRepository(owner, repo, commitSha) {
  const validName = /^[A-Za-z0-9_.-]+$/;

  if (!validName.test(owner) || !validName.test(repo)) {
    throw new Error("Invalid GitHub repository name");
  }

  if (!/^[a-f0-9]{40}$/i.test(commitSha)) {
    throw new Error("A valid 40-character commit SHA is required");
  }
}

async function downloadAndExtractRepository(owner, repo, commitSha) {
  validateRepository(owner, repo, commitSha);

  const temporaryRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "proofpay-github-")
  );

  const archivePath = path.join(temporaryRoot, "repository.tar.gz");
  const extractedDirectory = path.join(temporaryRoot, "repository");

  try {
    await fs.mkdir(extractedDirectory);

    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const url =
      `${API_BASE}/repos/${encodeURIComponent(owner)}/` +
      `${encodeURIComponent(repo)}/tarball/${encodeURIComponent(commitSha)}`;

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(120000)
    });

    if (!response.ok) {
      throw new Error(`GitHub archive download failed: HTTP ${response.status}`);
    }

    const contentLength = Number(response.headers.get("content-length"));

    if (contentLength > MAX_ARCHIVE_SIZE) {
      throw new Error("Repository archive exceeds the 50 MB download limit");
    }

    if (!response.body) {
      throw new Error("GitHub returned an empty archive");
    }

    let downloadedBytes = 0;

    const sizeLimiter = new Transform({
      transform(chunk, encoding, callback) {
        downloadedBytes += chunk.length;

        if (downloadedBytes > MAX_ARCHIVE_SIZE) {
          callback(new Error("Repository archive exceeds the 50 MB limit"));
          return;
        }

        callback(null, chunk);
      }
    });

    await pipeline(
      Readable.fromWeb(response.body),
      sizeLimiter,
      require("fs").createWriteStream(archivePath, { flags: "wx" })
    );

    let extractedFiles = 0;
    let extractedBytes = 0;

    await tar.x({
      file: archivePath,
      cwd: extractedDirectory,
      strip: 1,
      strict: true,
      filter: (entryPath, entry) => {
        if (
          typeof entryPath !== "string" ||
          entryPath.includes("\\") ||
          path.posix.isAbsolute(entryPath)
        ) {
          throw new Error("Unsafe archive path detected");
        }

        const segments = entryPath.split("/");

        if (segments.some(segment => segment === "..")) {
          throw new Error("Path traversal detected in archive");
        }

        const resolved = path.resolve(extractedDirectory, entryPath);
        const relative = path.relative(extractedDirectory, resolved);

        if (
          relative.startsWith("..") ||
          path.isAbsolute(relative)
        ) {
          throw new Error("Archive entry escapes extraction directory");
        }

        if (!["File", "Directory"].includes(entry.type)) {
          throw new Error("Unsupported archive entry type: " + entry.type);
        }

        extractedFiles++;

        if (extractedFiles > MAX_FILES) {
          throw new Error("Repository exceeds the 5000-entry extraction limit");
        }

        const size = Number(entry.size || 0);

        if (!Number.isSafeInteger(size) || size < 0) {
          throw new Error("Invalid archive entry size");
        }

        extractedBytes += size;

        if (extractedBytes > MAX_EXTRACTED_SIZE) {
          throw new Error("Repository exceeds the 200 MB extraction limit");
        }

        return true;
      }
    });

    await fs.rm(archivePath, { force: true });

    return {
      directory: extractedDirectory,
      commitSha,
      downloadedBytes,
      extractedFiles,
      extractedBytes,
      cleanup: async () => {
        await fs.rm(temporaryRoot, { recursive: true, force: true });
      }
    };
  } catch (error) {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
    throw error;
  }
}

module.exports = {
  downloadAndExtractRepository
};
