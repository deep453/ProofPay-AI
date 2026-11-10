const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");
const { randomUUID } = require("crypto");

const DOCKER_IMAGE = "node:22-alpine";
const INSTALL_TIMEOUT = 5 * 60 * 1000;
const TEST_TIMEOUT = 5 * 60 * 1000;

function runDocker(args, containerName, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn("C:\\Users\\HP\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe", args, { shell: false });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const maxOutput = 1024 * 1024;

    child.stdout.on("data", chunk => {
      const output = chunk.toString();
      process.stdout.write(output);
      if (stdout.length < maxOutput) {
        stdout += output.slice(0, maxOutput - stdout.length);
      }
    });

    child.stderr.on("data", chunk => {
      const output = chunk.toString();
      process.stderr.write(output);
      if (stderr.length < maxOutput) {
        stderr += output.slice(0, maxOutput - stderr.length);
      }
    });

    const timer = setTimeout(() => {
      timedOut = true;

      const killer = spawn("C:\\Users\\HP\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe", ["kill", containerName], {
        shell: false,
        stdio: "ignore"
      });

      killer.on("error", () => {});
    }, timeoutMs);

    child.on("error", error => {
      clearTimeout(timer);
      reject(error);
    });

    child.on("close", exitCode => {
      clearTimeout(timer);

      resolve({
        exitCode,
        stdout,
        stderr,
        timedOut
      });
    });
  });
}

function dockerBaseArgs(containerName, repositoryDirectory, network) {
  return [
    "run",
    "--name", containerName,
    "--network", network,
    "--memory", "1g",
    "--cpus", "2",
    "--pids-limit", "128",
    "--cap-drop", "ALL",
    "--security-opt", "no-new-privileges:true",
    "--read-only",
    "--tmpfs", "/tmp:rw,nosuid,nodev,size=128m",
    "--tmpfs", "/root/.npm:rw,nosuid,nodev,size=64m",
    "--mount",
    `type=bind,source=${repositoryDirectory},target=/workspace`,
    "--workdir", "/workspace",
    DOCKER_IMAGE
  ];
}

async function runVitestInDocker(repositoryDirectory) {
  const directory = await fs.realpath(repositoryDirectory);

  const packagePath = path.join(directory, "package.json");
  const lockPath = path.join(directory, "package-lock.json");

  const packageData = JSON.parse(
    await fs.readFile(packagePath, "utf8")
  );

  await fs.access(lockPath);

  const testScript = packageData.scripts?.test;

  if (!testScript || !/^vitest(?:\s|$)/.test(testScript.trim())) {
    throw new Error("Only projects with a Vitest test script are supported");
  }

  const id = randomUUID().replace(/-/g, "");

  const installContainer = `proofpay-install-${id}`;
  const testContainer = `proofpay-test-${id}`;

  console.log("STAGE 1: Installing locked dependencies");
  console.log("Network: enabled for dependency installation only");
  console.log("Lifecycle scripts: disabled");

  const installArgs = dockerBaseArgs(
    installContainer,
    directory,
    "bridge"
  );

  installArgs.push(
    "npm",
    "ci",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund"
  );

  console.log("INSTALL CONTAINER:", installContainer);

  const installResult = await runDocker(
    installArgs,
    installContainer,
    INSTALL_TIMEOUT
  );

  if (installResult.timedOut) {
    throw new Error("Dependency installation timed out");
  }

  if (installResult.exitCode !== 0) {
    throw new Error(
      `Dependency installation failed:\n${installResult.stderr}\n${installResult.stdout}`
    );
  }

  console.log("DEPENDENCIES INSTALLED");

  console.log("\nSTAGE 2: Running Vitest");
  console.log("Network: disabled");
  console.log("Container: resource-limited");

  const testArgs = dockerBaseArgs(
    testContainer,
    directory,
    "none"
  );

  testArgs.push("npm", "test", "--", "--run", "--pool=forks", "--maxWorkers=1");

  const startTime = Date.now();

  console.log("TEST CONTAINER:", testContainer);

  const testResult = await runDocker(
    testArgs,
    testContainer,
    TEST_TIMEOUT
  );

  const durationMs = Date.now() - startTime;

  return {
    passed: testResult.exitCode === 0 && !testResult.timedOut,
    exitCode: testResult.exitCode,
    timedOut: testResult.timedOut,
    durationMs,
    stdout: testResult.stdout,
    stderr: testResult.stderr,
    framework: "Vitest",
    networkDisabledDuringTests: true,
    dependencyInstallScriptsDisabled: true
  };
}

module.exports = {
  runVitestInDocker
};






