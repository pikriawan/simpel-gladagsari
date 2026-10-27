import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const node = process.execPath;
const children = [
  spawn(node, ["server/index.js"], { cwd: root, stdio: "inherit", env: process.env }),
  spawn(node, ["node_modules/vite/bin/vite.js"], { cwd: root, stdio: "inherit", env: process.env }),
];

let stopping = false;
let exitCode = 0;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  exitCode = code;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
}

for (const child of children) {
  child.on("error", (error) => {
    console.error("Gagal menjalankan proses development:", error);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stop(code || 1);
    if (children.every((process) => process.exitCode !== null)) {
      process.exitCode = exitCode;
    }
  });
}

process.on("SIGINT", () => stop(130));
process.on("SIGTERM", () => stop(143));
